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

# Part 1: Base
FILE="public_data_part_01_base.sql"
echo "-- Parte 01: Dados Base" > "$FILE"
generate_table "churches" "$FILE" "id, name, slug, address, phone, email, website, logo_url, settings, created_at, updated_at" "quote_literal(id) || ', ' || quote_literal(name) || ', ' || quote_literal(slug) || ', ' || COALESCE(quote_literal(address), 'NULL') || ', ' || COALESCE(quote_literal(phone), 'NULL') || ', ' || COALESCE(quote_literal(email), 'NULL') || ', ' || COALESCE(quote_literal(website), 'NULL') || ', ' || COALESCE(quote_literal(logo_url), 'NULL') || ', ' || COALESCE(quote_literal(settings), 'NULL') || ', ' || quote_literal(created_at) || ', ' || quote_literal(updated_at)"
generate_table "areas" "$FILE" "id, church_id, name, description, created_at, updated_at" "quote_literal(id) || ', ' || quote_literal(church_id) || ', ' || quote_literal(name) || ', ' || COALESCE(quote_literal(description), 'NULL') || ', ' || quote_literal(created_at) || ', ' || quote_literal(updated_at)"
generate_table "communities" "$FILE" "id, church_id, area_id, name, description, created_at, updated_at, logo_url, slug, welcome_video_url" "quote_literal(id) || ', ' || quote_literal(church_id) || ', ' || COALESCE(quote_literal(area_id), 'NULL') || ', ' || quote_literal(name) || ', ' || COALESCE(quote_literal(description), 'NULL') || ', ' || quote_literal(created_at) || ', ' || quote_literal(updated_at) || ', ' || COALESCE(quote_literal(logo_url), 'NULL') || ', ' || quote_literal(slug) || ', ' || COALESCE(quote_literal(welcome_video_url), 'NULL')"

# Part 2: Profiles & Roles
FILE="public_data_part_02_profiles_roles.sql"
echo "-- Parte 02: Profiles e Roles" > "$FILE"
generate_table "profiles" "$FILE" "id, full_name, role, church_id, area_id, community_id, status, created_at, updated_at, avatar_url, bio, birth_date, points, xp, level, rank, address, email, enrollment_status, is_active, phone, turma_id" "quote_literal(id) || ', ' || quote_literal(full_name) || ', ' || quote_literal(role) || ', ' || COALESCE(quote_literal(church_id), 'NULL') || ', ' || COALESCE(quote_literal(area_id), 'NULL') || ', ' || COALESCE(quote_literal(community_id), 'NULL') || ', ' || quote_literal(status) || ', ' || quote_literal(created_at) || ', ' || quote_literal(updated_at) || ', ' || COALESCE(quote_literal(avatar_url), 'NULL') || ', ' || COALESCE(quote_literal(bio), 'NULL') || ', ' || COALESCE(quote_literal(birth_date::text), 'NULL') || ', ' || points || ', ' || xp || ', ' || level || ', ' || rank || ', ' || COALESCE(quote_literal(address), 'NULL') || ', ' || COALESCE(quote_literal(email), 'NULL') || ', ' || COALESCE(quote_literal(enrollment_status), 'NULL') || ', ' || is_active || ', ' || COALESCE(quote_literal(phone), 'NULL') || ', ' || COALESCE(quote_literal(turma_id), 'NULL')"
generate_table "user_roles" "$FILE" "id, user_id, role, created_at, church_id, admin_area, is_super, is_super_admin" "quote_literal(id) || ', ' || quote_literal(user_id) || ', ' || quote_literal(role) || ', ' || quote_literal(created_at) || ', ' || COALESCE(quote_literal(church_id), 'NULL') || ', ' || COALESCE(quote_literal(admin_area), 'NULL') || ', ' || is_super || ', ' || is_super_admin"

# Part 3: Courses & Lessons
FILE="public_data_part_03_courses_lessons.sql"
echo "-- Parte 03: Courses e Lessons" > "$FILE"
generate_table "courses" "$FILE" "id, church_id, name, description, image_url, order_index, created_at, updated_at" "quote_literal(id) || ', ' || COALESCE(quote_literal(church_id), 'NULL') || ', ' || quote_literal(name) || ', ' || COALESCE(quote_literal(description), 'NULL') || ', ' || COALESCE(quote_literal(image_url), 'NULL') || ', ' || order_index || ', ' || quote_literal(created_at) || ', ' || quote_literal(updated_at)"
generate_table "lessons" "$FILE" "id, course_id, title, description, order_index, video_url, created_at, updated_at" "quote_literal(id) || ', ' || quote_literal(course_id) || ', ' || quote_literal(title) || ', ' || COALESCE(quote_literal(description), 'NULL') || ', ' || order_index || ', ' || COALESCE(quote_literal(video_url), 'NULL') || ', ' || quote_literal(created_at) || ', ' || quote_literal(updated_at)"

# Part 4: Progress & Attendance
FILE="public_data_part_04_progress_attendance.sql"
echo "-- Parte 04: Progress e Attendance" > "$FILE"
generate_table "devotional_responses" "$FILE" "id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id" "quote_literal(id) || ', ' || quote_literal(user_id) || ', ' || quote_literal(devotional_id) || ', ' || question_index || ', ' || quote_literal(response) || ', ' || quote_literal(created_at) || ', ' || quote_literal(updated_at) || ', ' || COALESCE(quote_literal(church_id), 'NULL')"
generate_table "devotional_progress" "$FILE" "id, user_id, devotional_id, completed_at, is_recovery, awarded_points, override_release_id, church_id" "quote_literal(id) || ', ' || quote_literal(user_id) || ', ' || quote_literal(devotional_id) || ', ' || quote_literal(completed_at) || ', ' || is_recovery || ', ' || awarded_points || ', ' || COALESCE(quote_literal(override_release_id), 'NULL') || ', ' || COALESCE(quote_literal(church_id), 'NULL')"

# Final validation query to append to part 06
