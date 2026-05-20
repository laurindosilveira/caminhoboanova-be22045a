#!/bin/bash

generate_table() {
    local table=$1
    local file=$2
    local cols=$3
    local values_sql=$4
    echo "-- Table: $table" >> "$file"
    psql -t -A -c "SELECT 'INSERT INTO public.$table ($cols) VALUES (' || $values_sql || ') ON CONFLICT DO NOTHING;' FROM public.$table" >> "$file"
    echo "" >> "$file"
}

# Part 5: Events & Chat
FILE="public_data_part_05_events_chat_notifications.sql"
echo "-- Parte 05: Events e Chat" > "$FILE"
generate_table "events" "$FILE" "id, title, description, event_date, location, area, community, type, created_by, created_at, linked_lesson_id, target_user_id, released_devotional_days, turma_id, church_id" "quote_literal(id) || ', ' || quote_literal(title) || ', ' || COALESCE(quote_literal(description), 'NULL') || ', ' || quote_literal(event_date::text) || ', ' || COALESCE(quote_literal(location), 'NULL') || ', ' || COALESCE(quote_literal(area), 'NULL') || ', ' || COALESCE(quote_literal(community), 'NULL') || ', ' || quote_literal(type) || ', ' || COALESCE(quote_literal(created_by), 'NULL') || ', ' || quote_literal(created_at) || ', ' || COALESCE(quote_literal(linked_lesson_id), 'NULL') || ', ' || COALESCE(quote_literal(target_user_id), 'NULL') || ', ' || COALESCE(quote_literal(released_devotional_days::text), 'NULL') || ', ' || COALESCE(quote_literal(turma_id), 'NULL') || ', ' || COALESCE(quote_literal(church_id), 'NULL')"
generate_table "community_chat" "$FILE" "id, community, user_id, user_name, message, created_at, reply_to, reply_to_name, reply_to_text, file_url, file_type, church_id" "quote_literal(id) || ', ' || quote_literal(community) || ', ' || quote_literal(user_id) || ', ' || quote_literal(user_name) || ', ' || quote_literal(message) || ', ' || quote_literal(created_at) || ', ' || COALESCE(quote_literal(reply_to), 'NULL') || ', ' || COALESCE(quote_literal(reply_to_name), 'NULL') || ', ' || COALESCE(quote_literal(reply_to_text), 'NULL') || ', ' || COALESCE(quote_literal(file_url), 'NULL') || ', ' || COALESCE(quote_literal(file_type), 'NULL') || ', ' || COALESCE(quote_literal(church_id), 'NULL')"
generate_table "notifications" "$FILE" "id, user_id, title, message, type, link, is_read, created_at" "quote_literal(id) || ', ' || quote_literal(user_id) || ', ' || quote_literal(title) || ', ' || quote_literal(message) || ', ' || quote_literal(type) || ', ' || COALESCE(quote_literal(link), 'NULL') || ', ' || is_read || ', ' || quote_literal(created_at)"

# Part 6: Settings & Achievements
FILE="public_data_part_06_settings_achievements.sql"
echo "-- Parte 06: Settings e Achievements" > "$FILE"
generate_table "system_settings" "$FILE" "key, value, updated_at" "quote_literal(key) || ', ' || quote_literal(value) || ', ' || quote_literal(updated_at)"
generate_table "game_config" "$FILE" "key, value, updated_at, church_id" "quote_literal(key) || ', ' || quote_literal(value) || ', ' || quote_literal(updated_at) || ', ' || COALESCE(quote_literal(church_id), 'NULL')"
generate_table "achievement_definitions" "$FILE" "id, key, icon, title, description, metric, target, bonus_points, is_secret, is_active, sort_order, created_at, updated_at, church_id" "quote_literal(id) || ', ' || quote_literal(key) || ', ' || quote_literal(icon) || ', ' || quote_literal(title) || ', ' || COALESCE(quote_literal(description), 'NULL') || ', ' || quote_literal(metric) || ', ' || target || ', ' || bonus_points || ', ' || is_secret || ', ' || is_active || ', ' || sort_order || ', ' || quote_literal(created_at) || ', ' || quote_literal(updated_at) || ', ' || COALESCE(quote_literal(church_id), 'NULL')"
generate_table "achievement_unlocks" "$FILE" "id, user_id, achievement_key, bonus_points, unlocked_at, church_id" "quote_literal(id) || ', ' || quote_literal(user_id) || ', ' || quote_literal(achievement_key) || ', ' || bonus_points || ', ' || quote_literal(unlocked_at) || ', ' || COALESCE(quote_literal(church_id), 'NULL')"

