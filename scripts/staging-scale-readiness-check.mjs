import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const STAGING_REF = "nuqwwlzklqdlnvqdbpjy";
const CHURCH_COUNT = Number.parseInt(process.env.CHURCH_COUNT ?? "50", 10);
const USERS_PER_CHURCH = Number.parseInt(process.env.USERS_PER_CHURCH ?? "2", 10);
const AUTH_CONCURRENCY = Number.parseInt(process.env.AUTH_CONCURRENCY ?? "10", 10);
const AUTH_RETRY_ATTEMPTS = Number.parseInt(process.env.AUTH_RETRY_ATTEMPTS ?? "6", 10);
const AUTH_RETRY_BASE_MS = Number.parseInt(process.env.AUTH_RETRY_BASE_MS ?? "1000", 10);
const CLIENT_SIGNIN_ATTEMPTS = Number.parseInt(process.env.CLIENT_SIGNIN_ATTEMPTS ?? "8", 10);
const CLIENT_SIGNIN_BASE_MS = Number.parseInt(process.env.CLIENT_SIGNIN_BASE_MS ?? "1500", 10);
const CLIENT_SIGNIN_PAUSE_MS = Number.parseInt(process.env.CLIENT_SIGNIN_PAUSE_MS ?? "3000", 10);
const CLIENT_SIGNIN_JITTER_MS = Number.parseInt(process.env.CLIENT_SIGNIN_JITTER_MS ?? "750", 10);
const CLIENT_SAMPLE = Number.parseInt(process.env.CLIENT_SAMPLE ?? "10", 10);

if (!Number.isInteger(CHURCH_COUNT) || CHURCH_COUNT < 2 || CHURCH_COUNT > 100) {
  throw new Error("CHURCH_COUNT must be an integer from 2 to 100.");
}

if (!Number.isInteger(USERS_PER_CHURCH) || USERS_PER_CHURCH < 1 || USERS_PER_CHURCH > 5) {
  throw new Error("USERS_PER_CHURCH must be an integer from 1 to 5.");
}

if (!Number.isInteger(AUTH_CONCURRENCY) || AUTH_CONCURRENCY < 1 || AUTH_CONCURRENCY > 25) {
  throw new Error("AUTH_CONCURRENCY must be an integer from 1 to 25.");
}

if (!Number.isInteger(AUTH_RETRY_ATTEMPTS) || AUTH_RETRY_ATTEMPTS < 1 || AUTH_RETRY_ATTEMPTS > 10) {
  throw new Error("AUTH_RETRY_ATTEMPTS must be an integer from 1 to 10.");
}

if (!Number.isInteger(CLIENT_SIGNIN_ATTEMPTS) || CLIENT_SIGNIN_ATTEMPTS < 1 || CLIENT_SIGNIN_ATTEMPTS > 12) {
  throw new Error("CLIENT_SIGNIN_ATTEMPTS must be an integer from 1 to 12.");
}

function readEnvFile(relativePath) {
  const envPath = path.join(process.cwd(), relativePath);
  const values = {};
  if (!fs.existsSync(envPath)) return values;

  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function sqlText(value) {
  return String(value).replaceAll("'", "''");
}

function sqlUuid(value) {
  return `'${sqlText(value)}'::uuid`;
}

function describeError(error) {
  if (!error) return "unknown error";
  const parts = [
    error.message,
    error.name,
    error.status ? `status=${error.status}` : "",
    error.code ? `code=${error.code}` : "",
    error.details ? `details=${error.details}` : "",
    error.hint ? `hint=${error.hint}` : "",
  ].filter(Boolean);
  return parts.join("; ") || JSON.stringify(error);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayMs(attempt, baseMs) {
  return (baseMs * attempt * attempt) + Math.floor(Math.random() * 250);
}

async function retry(label, action, attempts = 4, baseDelayMs = 750) {
  let lastError = null;
  let lastDurationMs = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const startedAt = performance.now();
    try {
      const { data, error } = await action();
      const durationMs = Math.round(performance.now() - startedAt);
      lastDurationMs = durationMs;
      if (!error) return { data, durationMs, attempts: attempt };

      lastError = error;
    } catch (error) {
      lastDurationMs = Math.round(performance.now() - startedAt);
      lastError = error;
    }

    if (attempt < attempts) await sleep(retryDelayMs(attempt, baseDelayMs));
  }

  return {
    error: `${label}: ${describeError(lastError)}`,
    durationMs: lastDurationMs,
    attempts,
  };
}

async function poolMap(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => runWorker(),
  );
  await Promise.all(workers);
  return results;
}

function chunks(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

const publicEnv = readEnvFile(".env.local");
const secretEnv = readEnvFile("supabase/secrets.staging.local.env");
const authEnv = readEnvFile("supabase/auth-smtp.local.env");

const supabaseUrl = publicEnv.VITE_SUPABASE_URL ?? secretEnv.SUPABASE_URL;
const anonKey = publicEnv.VITE_SUPABASE_PUBLISHABLE_KEY ?? secretEnv.SUPABASE_ANON_KEY;
const serviceRoleKey = secretEnv.SUPABASE_SERVICE_ROLE_KEY;
const accessToken = authEnv.SUPABASE_ACCESS_TOKEN;

if (!supabaseUrl?.includes(STAGING_REF)) {
  throw new Error(`Blocked: expected staging project ${STAGING_REF}, got ${supabaseUrl || "missing URL"}.`);
}

if (!anonKey || !serviceRoleKey || !accessToken) {
  throw new Error("Missing staging anon, service role, or Supabase access token in local env files.");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const warnings = [];
const clientChecks = [];

function recordClient(name, passed, details) {
  clientChecks.push({ name, passed, details });
}

function summarizeChecks(checks) {
  const failures = checks.filter((check) => !check.passed);
  return {
    total: checks.length,
    passed: checks.length - failures.length,
    failed: failures.length,
    failures,
  };
}

async function must(label, promise) {
  const { data, error } = await promise;
  if (error) throw new Error(`${label}: ${describeError(error)}`);
  return data;
}

async function maybe(label, promise) {
  const { data, error } = await promise;
  if (error) {
    warnings.push(`${label}: ${describeError(error)}`);
    return null;
  }
  return data;
}

async function deleteWhereIn(table, column, values) {
  if (!values.length) return;
  const { error } = await admin.from(table).delete().in(column, values);
  if (error) warnings.push(`cleanup ${table}: ${describeError(error)}`);
}

async function listCodexAuthUsers() {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      warnings.push(`cleanup list auth users: ${describeError(error)}`);
      return users;
    }

    users.push(
      ...(data.users ?? []).filter((user) =>
        /^codex\.(alpha|beta|church\d+|scale)\./i.test(user.email ?? ""),
      ),
    );

    if (!data.users || data.users.length < 1000) return users;
    page += 1;
  }
}

async function cleanupCodexFixtures() {
  const { data: oldChurches, error } = await admin
    .from("churches")
    .select("id")
    .like("slug", "codex-%");

  if (error) throw new Error(`cleanup churches lookup: ${describeError(error)}`);

  const oldChurchIds = (oldChurches ?? []).map((church) => church.id);
  const oldAuthUsers = await listCodexAuthUsers();
  const oldUserIds = oldAuthUsers.map((user) => user.id);

  await deleteWhereIn("lesson_responses", "user_id", oldUserIds);
  await deleteWhereIn("devotional_responses", "user_id", oldUserIds);
  await deleteWhereIn("lesson_progress", "user_id", oldUserIds);
  await deleteWhereIn("devotional_progress", "user_id", oldUserIds);
  await deleteWhereIn("attendance", "user_id", oldUserIds);
  await deleteWhereIn("worship_attendance", "user_id", oldUserIds);
  await deleteWhereIn("user_progress", "user_id", oldUserIds);
  await deleteWhereIn("achievement_unlocks", "user_id", oldUserIds);
  await deleteWhereIn("challenge_participants", "user_id", oldUserIds);
  await deleteWhereIn("discipleship_plans", "user_id", oldUserIds);
  await deleteWhereIn("pastoral_notes", "user_id", oldUserIds);
  await deleteWhereIn("spiritual_assessments", "user_id", oldUserIds);
  await deleteWhereIn("meeting_evaluations", "user_id", oldUserIds);
  await deleteWhereIn("notification_preferences", "user_id", oldUserIds);
  await deleteWhereIn("community_chat", "user_id", oldUserIds);
  await deleteWhereIn("prayer_requests", "user_id", oldUserIds);
  await deleteWhereIn("user_devotional_overrides", "user_id", oldUserIds);
  await deleteWhereIn("user_lesson_overrides", "user_id", oldUserIds);
  await deleteWhereIn("year_promotion_requests", "user_id", oldUserIds);
  await deleteWhereIn("user_roles", "user_id", oldUserIds);
  await deleteWhereIn("profiles", "user_id", oldUserIds);

  await deleteWhereIn("lesson_responses", "church_id", oldChurchIds);
  await deleteWhereIn("devotional_responses", "church_id", oldChurchIds);
  await deleteWhereIn("attendance", "church_id", oldChurchIds);
  await deleteWhereIn("worship_attendance", "church_id", oldChurchIds);
  await deleteWhereIn("lesson_progress", "church_id", oldChurchIds);
  await deleteWhereIn("devotional_progress", "church_id", oldChurchIds);
  await deleteWhereIn("user_progress", "church_id", oldChurchIds);
  await deleteWhereIn("achievement_unlocks", "church_id", oldChurchIds);
  await deleteWhereIn("challenge_participants", "church_id", oldChurchIds);
  await deleteWhereIn("discipleship_plans", "church_id", oldChurchIds);
  await deleteWhereIn("pastoral_notes", "church_id", oldChurchIds);
  await deleteWhereIn("spiritual_assessments", "church_id", oldChurchIds);
  await deleteWhereIn("meeting_evaluations", "church_id", oldChurchIds);
  await deleteWhereIn("notification_preferences", "church_id", oldChurchIds);
  await deleteWhereIn("community_chat", "church_id", oldChurchIds);
  await deleteWhereIn("prayer_requests", "church_id", oldChurchIds);
  await deleteWhereIn("user_devotional_overrides", "church_id", oldChurchIds);
  await deleteWhereIn("user_lesson_overrides", "church_id", oldChurchIds);
  await deleteWhereIn("year_promotion_requests", "church_id", oldChurchIds);
  await deleteWhereIn("profiles", "church_id", oldChurchIds);
  await deleteWhereIn("user_roles", "church_id", oldChurchIds);
  await deleteWhereIn("events", "church_id", oldChurchIds);
  await deleteWhereIn("activities", "church_id", oldChurchIds);
  await deleteWhereIn("turmas", "church_id", oldChurchIds);
  await deleteWhereIn("church_subscriptions", "church_id", oldChurchIds);
  await deleteWhereIn("communities", "church_id", oldChurchIds);
  await deleteWhereIn("areas", "church_id", oldChurchIds);
  await deleteWhereIn("churches", "id", oldChurchIds);

  await poolMap(oldAuthUsers, 8, async (user) => {
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) warnings.push(`cleanup auth ${user.email}: ${describeError(deleteError)}`);
  });
}

function runSupabaseCli(args) {
  const command =
    process.platform === "win32"
      ? ["cmd.exe", ["/d", "/c", "npx", "supabase", ...args]]
      : ["npx", ["supabase", ...args]];
  return execFileSync(command[0], command[1], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      SUPABASE_ACCESS_TOKEN: accessToken,
      SUPABASE_NO_TELEMETRY: "1",
    },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function parseCliJson(output) {
  const start = output.indexOf("{");
  if (start === -1) throw new Error(`Could not parse Supabase CLI output: ${output}`);
  return JSON.parse(output.slice(start));
}

async function selectByInChunks(table, select, column, values, size = 75) {
  const rows = [];
  for (const valueChunk of chunks(values, size)) {
    const data = await must(
      `${table} select chunk`,
      admin.from(table).select(select).in(column, valueChunk),
    );
    rows.push(...(data ?? []));
  }
  return rows;
}

async function insertRows(table, rows, size = 100) {
  const inserted = [];
  for (const rowChunk of chunks(rows, size)) {
    const data = await must(
      `${table} insert`,
      admin.from(table).insert(rowChunk).select("*"),
    );
    inserted.push(...(data ?? []));
  }
  return inserted;
}

async function upsertRows(table, rows, onConflict, size = 100) {
  const upserted = [];
  for (const rowChunk of chunks(rows, size)) {
    const data = await must(
      `${table} upsert`,
      admin.from(table).upsert(rowChunk, { onConflict }).select("*"),
    );
    upserted.push(...(data ?? []));
  }
  return upserted;
}

async function signInFixture(fixture) {
  await sleep(CLIENT_SIGNIN_PAUSE_MS + Math.floor(Math.random() * CLIENT_SIGNIN_JITTER_MS));
  const client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = await retry(`sign in ${fixture.email}`, () =>
    client.auth.signInWithPassword({ email: fixture.email, password: fixture.password }),
    CLIENT_SIGNIN_ATTEMPTS,
    CLIENT_SIGNIN_BASE_MS,
  );

  if (result.error) throw new Error(result.error);
  if (!result.data.session) throw new Error(`sign in ${fixture.email}: no session returned`);
  fixture.signInAttempts = result.attempts;
  fixture.signInDurationMs = result.durationMs;
  return client;
}

function clientSelectFor(tableName) {
  return tableName === "profiles" ? "user_id,church_id" : "id,church_id";
}

function clientIdColumnFor(tableName) {
  return tableName === "profiles" ? "user_id" : "id";
}

function clientRowId(row) {
  return row.id ?? row.user_id;
}

async function runClientSample(fixtures, tableNames) {
  const sampleSize = Math.min(CLIENT_SAMPLE, fixtures.length);
  const step = Math.max(1, Math.floor(fixtures.length / sampleSize));
  const sampled = [];

  for (let index = 0; index < fixtures.length && sampled.length < sampleSize; index += step) {
    sampled.push(fixtures[index]);
  }

  for (const fixture of sampled) {
    const client = await signInFixture(fixture);
    const nextFixture = fixtures[(fixture.globalIndex + USERS_PER_CHURCH) % fixtures.length];

    const { data: churchId, error: rpcError } = await client.rpc("get_auth_church_id");
    recordClient(
      `${fixture.label} client resolves own church`,
      !rpcError && churchId === fixture.churchId,
      rpcError ? rpcError.message : churchId ?? "null",
    );

    for (const tableName of tableNames) {
      const idsToCheck = fixtures
        .flatMap((item) => item.rows[tableName] ? [item.rows[tableName]] : [])
        .slice(0, 1000);

      const { data, error } = await client
        .from(tableName)
        .select(clientSelectFor(tableName))
        .in(clientIdColumnFor(tableName), idsToCheck);

      if (error) {
        recordClient(`${fixture.label} client reads ${tableName}`, false, error.message);
        continue;
      }

      const leaks = (data ?? []).filter((row) => row.church_id && row.church_id !== fixture.churchId);
      recordClient(
        `${fixture.label} client cannot read other churches in ${tableName}`,
        leaks.length === 0,
        leaks.length === 0 ? `${data?.length ?? 0} visible fixture rows` : JSON.stringify(leaks.slice(0, 5)),
      );
    }

    const progress = await client
      .from("user_progress")
      .insert({
        user_id: fixture.userId,
        activity_id: nextFixture.rows.activities,
        church_id: nextFixture.churchId,
      })
      .select("id,church_id,activity_id")
      .maybeSingle();

    if (progress.data?.id) await admin.from("user_progress").delete().eq("id", progress.data.id);
    recordClient(
      `${fixture.label} client cannot link progress to another church activity`,
      Boolean(progress.error) || progress.data?.activity_id !== nextFixture.rows.activities,
      progress.error ? progress.error.message : JSON.stringify(progress.data ?? null),
    );

    const attendance = await client
      .from("attendance")
      .insert({
        user_id: fixture.userId,
        event_id: nextFixture.rows.events,
        status: "presente",
        church_id: nextFixture.churchId,
      })
      .select("id,church_id,event_id")
      .maybeSingle();

    if (attendance.data?.id) await admin.from("attendance").delete().eq("id", attendance.data.id);
    recordClient(
      `${fixture.label} client cannot link attendance to another church event`,
      Boolean(attendance.error) || attendance.data?.event_id !== nextFixture.rows.events,
      attendance.error ? attendance.error.message : JSON.stringify(attendance.data ?? null),
    );

    await client.auth.signOut();
  }
}

function buildRlsSql({ fixtures, churchRows, tableNames, runId }) {
  const subjectsValues = fixtures
    .map((item) =>
      `(${item.globalIndex}, ${item.churchIndex}, ${item.userIndex}, '${sqlText(item.label)}', ${sqlUuid(item.userId)}, ${sqlUuid(item.churchId)})`,
    )
    .join(",\n");

  const rowValues = [];

  for (const church of churchRows) {
    rowValues.push(`('turmas', 'id', 'church', ${church.churchIndex}, null, ${sqlUuid(church.turmaId)}, ${sqlUuid(church.churchId)})`);
    rowValues.push(`('events', 'id', 'church', ${church.churchIndex}, null, ${sqlUuid(church.eventId)}, ${sqlUuid(church.churchId)})`);
    rowValues.push(`('activities', 'id', 'church', ${church.churchIndex}, null, ${sqlUuid(church.activityId)}, ${sqlUuid(church.churchId)})`);
  }

  for (const item of fixtures) {
    for (const [tableName, rowId] of Object.entries(item.rows)) {
      if (["turmas", "events", "activities"].includes(tableName)) continue;
      const idColumn = tableName === "profiles" ? "user_id" : "id";
      const visibility = ["user_progress", "attendance", "notification_preferences"].includes(tableName)
        ? "personal"
        : "church";
      rowValues.push(
        `('${sqlText(tableName)}', '${sqlText(idColumn)}', '${visibility}', ${item.churchIndex}, ${sqlUuid(item.userId)}, ${sqlUuid(rowId)}, ${sqlUuid(item.churchId)})`,
      );
    }
  }

  const tableValues = tableNames
    .map((tableName) => {
      const idColumn = tableName === "profiles" ? "user_id" : "id";
      const visibility = ["user_progress", "attendance", "notification_preferences"].includes(tableName)
        ? "personal"
        : "church";
      return `('${sqlText(tableName)}', '${sqlText(idColumn)}', '${visibility}')`;
    })
    .join(",\n");

  return `
create temp table codex_subjects (
  global_index int primary key,
  church_index int not null,
  user_index int not null,
  label text not null,
  user_id uuid not null,
  church_id uuid not null
);

insert into codex_subjects values
${subjectsValues};

create temp table codex_tables (
  table_name text not null,
  id_column text not null,
  visibility text not null
);

insert into codex_tables values
${tableValues};

create temp table codex_rows (
  table_name text not null,
  id_column text not null,
  visibility text not null,
  church_index int not null,
  owner_user_id uuid null,
  row_id uuid not null,
  church_id uuid not null
);

insert into codex_rows values
${rowValues.join(",\n")};

create temp table codex_results (
  name text not null,
  passed boolean not null,
  details text not null
);

do $$
declare
  s record;
  t record;
  own_church_ids uuid[];
  own_user_ids uuid[];
  same_church_other_user_ids uuid[];
  other_church_ids uuid[];
  own_church_count int := 0;
  own_user_count int := 0;
  same_church_other_count int := 0;
  other_church_count int := 0;
  resolved_church uuid;
  next_activity uuid;
  next_event uuid;
  next_church uuid;
  inserted_id uuid;
begin
  for s in select * from codex_subjects order by global_index loop
    execute 'set local role authenticated';
    perform set_config('request.jwt.claim.sub', s.user_id::text, true);
    perform set_config('request.jwt.claim.role', 'authenticated', true);
    select public.get_auth_church_id() into resolved_church;
    execute 'reset role';

    insert into codex_results values (
      s.label || ' resolves own church',
      resolved_church = s.church_id,
      coalesce(resolved_church::text, 'null')
    );

    for t in select * from codex_tables order by table_name loop
      select array_agg(row_id) into own_church_ids
      from codex_rows
      where table_name = t.table_name
        and church_id = s.church_id;

      select array_agg(row_id) into own_user_ids
      from codex_rows
      where table_name = t.table_name
        and owner_user_id = s.user_id;

      select array_agg(row_id) into same_church_other_user_ids
      from codex_rows
      where table_name = t.table_name
        and church_id = s.church_id
        and owner_user_id is not null
        and owner_user_id <> s.user_id;

      select array_agg(row_id) into other_church_ids
      from codex_rows
      where table_name = t.table_name
        and church_id <> s.church_id;

      execute 'set local role authenticated';
      perform set_config('request.jwt.claim.sub', s.user_id::text, true);
      perform set_config('request.jwt.claim.role', 'authenticated', true);

      execute format('select count(*)::int from public.%I where %I = any($1)', t.table_name, t.id_column)
        into own_church_count
        using coalesce(own_church_ids, array[]::uuid[]);

      execute format('select count(*)::int from public.%I where %I = any($1)', t.table_name, t.id_column)
        into own_user_count
        using coalesce(own_user_ids, array[]::uuid[]);

      execute format('select count(*)::int from public.%I where %I = any($1)', t.table_name, t.id_column)
        into same_church_other_count
        using coalesce(same_church_other_user_ids, array[]::uuid[]);

      execute format('select count(*)::int from public.%I where %I = any($1)', t.table_name, t.id_column)
        into other_church_count
        using coalesce(other_church_ids, array[]::uuid[]);

      execute 'reset role';

      insert into codex_results values (
        s.label || ' sees own church fixtures in ' || t.table_name,
        own_church_count > 0,
        'own_church_visible=' || own_church_count::text
      );

      insert into codex_results values (
        s.label || ' cannot see other churches in ' || t.table_name,
        other_church_count = 0,
        'other_church_visible=' || other_church_count::text
      );

      if t.visibility = 'personal' then
        insert into codex_results values (
          s.label || ' sees own personal rows in ' || t.table_name,
          own_user_count > 0,
          'own_user_visible=' || own_user_count::text
        );

        insert into codex_results values (
          s.label || ' cannot see same church personal rows in ' || t.table_name,
          same_church_other_count = 0,
          'same_church_other_visible=' || same_church_other_count::text
        );
      end if;
    end loop;

    select church_id into next_church
    from codex_subjects
    where church_index = case when s.church_index = ${CHURCH_COUNT} then 1 else s.church_index + 1 end
    order by user_index
    limit 1;

    select row_id into next_activity
    from codex_rows
    where table_name = 'activities'
      and church_index = case when s.church_index = ${CHURCH_COUNT} then 1 else s.church_index + 1 end
    limit 1;

    select row_id into next_event
    from codex_rows
    where table_name = 'events'
      and church_index = case when s.church_index = ${CHURCH_COUNT} then 1 else s.church_index + 1 end
    limit 1;

    begin
      execute 'set local role authenticated';
      perform set_config('request.jwt.claim.sub', s.user_id::text, true);
      perform set_config('request.jwt.claim.role', 'authenticated', true);

      insert into public.user_progress (user_id, activity_id, church_id)
      values (s.user_id, next_activity, next_church)
      returning id into inserted_id;

      execute 'reset role';
      delete from public.user_progress where id = inserted_id;
      insert into codex_results values (
        s.label || ' cannot link progress to another church activity',
        false,
        'unexpected insert succeeded and was deleted'
      );
    exception when others then
      execute 'reset role';
      insert into codex_results values (
        s.label || ' cannot link progress to another church activity',
        sqlstate = '23514' or sqlstate = '42501',
        sqlstate || ': ' || sqlerrm
      );
    end;

    begin
      execute 'set local role authenticated';
      perform set_config('request.jwt.claim.sub', s.user_id::text, true);
      perform set_config('request.jwt.claim.role', 'authenticated', true);

      insert into public.attendance (user_id, event_id, status, church_id)
      values (s.user_id, next_event, 'presente', next_church)
      returning id into inserted_id;

      execute 'reset role';
      delete from public.attendance where id = inserted_id;
      insert into codex_results values (
        s.label || ' cannot link attendance to another church event',
        false,
        'unexpected insert succeeded and was deleted'
      );
    exception when others then
      execute 'reset role';
      insert into codex_results values (
        s.label || ' cannot link attendance to another church event',
        sqlstate = '23514' or sqlstate = '42501',
        sqlstate || ': ' || sqlerrm
      );
    end;
  end loop;
end $$;

select json_build_object(
  'total', count(*),
  'passed', count(*) filter (where passed),
  'failed', count(*) filter (where not passed),
  'failures', coalesce(
    json_agg(json_build_object('name', name, 'details', details) order by name) filter (where not passed),
    '[]'::json
  )
) as result
from codex_results;
`;
}

const startedAt = performance.now();
await cleanupCodexFixtures();

if (process.env.CLEANUP_ONLY === "1") {
  console.log(JSON.stringify({
    project: supabaseUrl,
    cleanupOnly: true,
    durationMs: Math.round(performance.now() - startedAt),
    warnings,
  }, null, 2));
  process.exit(warnings.length > 0 ? 1 : 0);
}

const runId = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const marker = `CODEX_SCALE_READINESS_${runId}`;
const password = `ScaleReadiness#${runId}`;

const churchInputRows = Array.from({ length: CHURCH_COUNT }, (_, index) => {
  const churchIndex = index + 1;
  const suffix = String(churchIndex).padStart(3, "0");
  return {
    church_index: churchIndex,
    name: `Codex Scale Igreja ${suffix} ${runId}`,
    slug: `codex-scale-church${suffix}-${runId}`,
    city: "Teste",
    state: "TS",
    is_active: true,
  };
});

const churches = await insertRows(
  "churches",
  churchInputRows.map(({ church_index: _churchIndex, ...row }) => row),
  100,
);

const churchBySlug = new Map(churches.map((church) => [church.slug, church]));
const churchRows = churchInputRows.map((input) => ({
  churchIndex: input.church_index,
  churchId: churchBySlug.get(input.slug)?.id,
  churchName: input.name,
  churchSlug: input.slug,
}));

if (churchRows.some((church) => !church.churchId)) {
  throw new Error("Could not map inserted churches back to their generated ids.");
}

await insertRows(
  "church_subscriptions",
  churchRows.map((church) => ({
    church_id: church.churchId,
    church_name: church.churchName,
    church_email: `scale.church${String(church.churchIndex).padStart(3, "0")}.${runId}@example.com`,
    pastor_name: `Codex Scale Pastor ${church.churchIndex}`,
    pastor_email: `scale.pastor${String(church.churchIndex).padStart(3, "0")}.${runId}@example.com`,
    recommended_plan: "teste",
    subscription_status: "active",
    is_active: true,
    member_limit: 500,
  })),
  100,
);

const turmas = await insertRows(
  "turmas",
  churchRows.map((church) => ({
    name: `Turma Scale ${String(church.churchIndex).padStart(3, "0")} ${runId}`,
    description: marker,
    area: "Sem area",
    church_id: church.churchId,
    year: 2099,
    is_active: true,
  })),
  100,
);

const activities = await insertRows(
  "activities",
  churchRows.map((church) => ({
    title: `Activity Scale ${String(church.churchIndex).padStart(3, "0")} ${runId}`,
    subtitle: marker,
    type: "formacao",
    order_num: 9000 + church.churchIndex,
    points: 1,
    church_id: church.churchId,
  })),
  100,
);

const events = await insertRows(
  "events",
  churchRows.map((church) => ({
    title: `Event Scale ${String(church.churchIndex).padStart(3, "0")} ${runId}`,
    description: marker,
    event_date: "2099-01-01T12:00:00.000Z",
    type: "test",
    area: "Sem area",
    community: "Aguardando definicao",
    church_id: church.churchId,
  })),
  100,
);

const turmaByChurch = new Map(turmas.map((row) => [row.church_id, row]));
const activityByChurch = new Map(activities.map((row) => [row.church_id, row]));
const eventByChurch = new Map(events.map((row) => [row.church_id, row]));

for (const church of churchRows) {
  church.turmaId = turmaByChurch.get(church.churchId)?.id;
  church.activityId = activityByChurch.get(church.churchId)?.id;
  church.eventId = eventByChurch.get(church.churchId)?.id;
}

const userRequests = churchRows.flatMap((church) =>
  Array.from({ length: USERS_PER_CHURCH }, (_, userIndex) => {
    const displayUserIndex = userIndex + 1;
    const churchSuffix = String(church.churchIndex).padStart(3, "0");
    return {
      churchIndex: church.churchIndex,
      userIndex: displayUserIndex,
      churchId: church.churchId,
      turmaId: church.turmaId,
      label: `church${churchSuffix}.user${displayUserIndex}`,
      email: `codex.scale.c${churchSuffix}.u${displayUserIndex}.${runId}@example.com`,
      fullName: `Codex Scale User C${churchSuffix} U${displayUserIndex} ${runId}`,
    };
  }),
);

const authStartedAt = performance.now();
const authResults = await poolMap(userRequests, AUTH_CONCURRENCY, async (request, globalIndex) => {
  const result = await retry(`create user ${request.email}`, () =>
    admin.auth.admin.createUser({
      email: request.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: request.fullName,
        birth_date: "2012-01-01",
        phone: "51999999999",
        church_id: request.churchId,
        enrollment_status: "pending",
        role: "user",
        father_name: "",
        mother_name: "",
        father_phone: "",
        mother_phone: "",
      },
    }),
    AUTH_RETRY_ATTEMPTS,
    AUTH_RETRY_BASE_MS,
  );

  return {
    ...request,
    globalIndex,
    userId: result.data?.user?.id ?? null,
    authError: result.error ?? null,
    authAttempts: result.attempts,
    authDurationMs: result.durationMs,
  };
});
const authDurationMs = Math.round(performance.now() - authStartedAt);

const authFailures = authResults.filter((result) => result.authError);
if (authFailures.length > 0) {
  console.log(JSON.stringify({
    project: supabaseUrl,
    runId,
    marker,
    auth: {
      attempted: authResults.length,
      succeeded: authResults.length - authFailures.length,
      failed: authFailures.length,
      durationMs: authDurationMs,
      sampleFailures: authFailures.slice(0, 10).map((item) => ({ email: item.email, error: item.authError })),
    },
    warnings,
  }, null, 2));
  process.exit(1);
}

const users = authResults.map((result) => ({
  ...result,
  userId: result.userId,
  password,
}));

await sleep(1500);
const profiles = await selectByInChunks(
  "profiles",
  "user_id,email,church_id,area,community,enrollment_status",
  "user_id",
  users.map((user) => user.userId),
);
const profileByUser = new Map(profiles.map((profile) => [profile.user_id, profile]));

const profileChecks = users.flatMap((user) => {
  const profile = profileByUser.get(user.userId);
  return [
    {
      name: `${user.label} has profile`,
      passed: Boolean(profile),
      details: profile ? "created" : "missing",
    },
    {
      name: `${user.label} profile has own church`,
      passed: profile?.church_id === user.churchId,
      details: profile?.church_id ?? "missing",
    },
    {
      name: `${user.label} profile uses pending enrollment`,
      passed: profile?.enrollment_status === "pending",
      details: profile?.enrollment_status ?? "missing",
    },
    {
      name: `${user.label} profile fallback area/community`,
      passed: profile?.area === "Sem area" && profile?.community === "Aguardando definicao",
      details: `area=${profile?.area ?? "missing"} community=${profile?.community ?? "missing"}`,
    },
  ];
});

await upsertRows(
  "user_roles",
  users.map((user) => ({
    user_id: user.userId,
    church_id: user.churchId,
    role: "user",
    is_super: false,
    is_super_admin: false,
  })),
  "user_id,role",
  100,
);

const progressRows = await insertRows(
  "user_progress",
  users.map((user) => ({
    user_id: user.userId,
    activity_id: activityByChurch.get(user.churchId).id,
    church_id: user.churchId,
  })),
  100,
);

const attendanceRows = await insertRows(
  "attendance",
  users.map((user) => ({
    user_id: user.userId,
    event_id: eventByChurch.get(user.churchId).id,
    status: "presente",
    church_id: user.churchId,
  })),
  100,
);

const chatRows = await insertRows(
  "community_chat",
  users.map((user) => ({
    user_id: user.userId,
    user_name: user.fullName,
    community: "Aguardando definicao",
    message: `${marker} chat ${user.label}`,
    church_id: user.churchId,
  })),
  100,
);

const prayerRows = await insertRows(
  "prayer_requests",
  users.map((user) => ({
    user_id: user.userId,
    area: "Sem area",
    community: "Aguardando definicao",
    visibility: "public",
    content: `${marker} prayer ${user.label}`,
    church_id: user.churchId,
  })),
  100,
);

const preferenceRows = await insertRows(
  "notification_preferences",
  users.map((user) => ({
    user_id: user.userId,
    church_id: user.churchId,
    master_enabled: true,
    preferred_hour: 9,
  })),
  100,
);

const progressByUser = new Map(progressRows.map((row) => [row.user_id, row]));
const attendanceByUser = new Map(attendanceRows.map((row) => [row.user_id, row]));
const chatByUser = new Map(chatRows.map((row) => [row.user_id, row]));
const prayerByUser = new Map(prayerRows.map((row) => [row.user_id, row]));
const preferenceByUser = new Map(preferenceRows.map((row) => [row.user_id, row]));
const churchRowByIndex = new Map(churchRows.map((row) => [row.churchIndex, row]));

const fixtures = users.map((user) => {
  const church = churchRowByIndex.get(user.churchIndex);
  return {
    ...user,
    rows: {
      profiles: user.userId,
      turmas: church.turmaId,
      events: church.eventId,
      activities: church.activityId,
      user_progress: progressByUser.get(user.userId).id,
      attendance: attendanceByUser.get(user.userId).id,
      community_chat: chatByUser.get(user.userId).id,
      prayer_requests: prayerByUser.get(user.userId).id,
      notification_preferences: preferenceByUser.get(user.userId).id,
    },
  };
});

const tableNames = [
  "profiles",
  "turmas",
  "events",
  "activities",
  "user_progress",
  "attendance",
  "community_chat",
  "prayer_requests",
  "notification_preferences",
];

runSupabaseCli(["link", "--project-ref", STAGING_REF]);
const rlsSql = buildRlsSql({ fixtures, churchRows, tableNames, runId });
const sqlPath = path.join(os.tmpdir(), `codex-scale-readiness-${runId}.sql`);
fs.writeFileSync(sqlPath, rlsSql, "utf8");

const rlsStartedAt = performance.now();
const cliOutput = runSupabaseCli(["db", "query", "--linked", "--file", sqlPath]);
const rlsDurationMs = Math.round(performance.now() - rlsStartedAt);
const rlsResult = parseCliJson(cliOutput).rows?.[0]?.result;

const clientStartedAt = performance.now();
await runClientSample(fixtures, tableNames);
const clientDurationMs = Math.round(performance.now() - clientStartedAt);
const clientResult = summarizeChecks(clientChecks);
const profileResult = summarizeChecks(profileChecks);

const output = {
  project: supabaseUrl,
  runId,
  marker,
  parameters: {
    churchCount: CHURCH_COUNT,
    usersPerChurch: USERS_PER_CHURCH,
    totalUsers: users.length,
    authConcurrency: AUTH_CONCURRENCY,
    authRetryAttempts: AUTH_RETRY_ATTEMPTS,
    authRetryBaseMs: AUTH_RETRY_BASE_MS,
    clientSigninAttempts: CLIENT_SIGNIN_ATTEMPTS,
    clientSigninBaseMs: CLIENT_SIGNIN_BASE_MS,
    clientSigninPauseMs: CLIENT_SIGNIN_PAUSE_MS,
    clientSigninJitterMs: CLIENT_SIGNIN_JITTER_MS,
    clientSample: Math.min(CLIENT_SAMPLE, fixtures.length),
  },
  timingsMs: {
    total: Math.round(performance.now() - startedAt),
    authConcurrentCreateUsers: authDurationMs,
    rlsMatrix: rlsDurationMs,
    clientSample: clientDurationMs,
  },
  auth: {
    attempted: authResults.length,
    succeeded: authResults.length - authFailures.length,
    failed: authFailures.length,
    maxAttemptsUsed: Math.max(...authResults.map((result) => result.authAttempts)),
    retriedCreates: authResults.filter((result) => result.authAttempts > 1).length,
    avgDurationMs: Math.round(
      authResults.reduce((sum, item) => sum + (item.authDurationMs ?? 0), 0) / authResults.length,
    ),
  },
  clientAuth: {
    signInMaxAttemptsUsed: Math.max(...fixtures.map((fixture) => fixture.signInAttempts ?? 0)),
    retriedSignIns: fixtures.filter((fixture) => (fixture.signInAttempts ?? 0) > 1).length,
    avgSignInDurationMs: Math.round(
      fixtures.reduce((sum, item) => sum + (item.signInDurationMs ?? 0), 0) / fixtures.length,
    ),
  },
  fixtures: {
    churches: churchRows.length,
    users: users.length,
    sampleChurches: churchRows.slice(0, 5).map((church) => ({
      name: church.churchName,
      slug: church.churchSlug,
      id: church.churchId,
    })),
    sampleUsers: users.slice(0, 5).map((user) => user.email),
    password,
  },
  profileTrigger: profileResult,
  rls: rlsResult,
  client: clientResult,
  warnings,
};

console.log(JSON.stringify(output, null, 2));

if (
  warnings.length > 0 ||
  profileResult.failed > 0 ||
  !rlsResult ||
  rlsResult.failed > 0 ||
  clientResult.failed > 0
) {
  process.exitCode = 1;
}
