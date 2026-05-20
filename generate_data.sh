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
generate_table "churches" "$FILE" "id, name, slug, address, city, state, logo_url, primary_color, secondary_color, is_active, created_at, updated_at" "quote_literal(id) || ', ' || quote_literal(name) || ', ' || quote_literal(slug) || ', ' || COALESCE(quote_literal(address), 'NULL') || ', ' || COALESCE(quote_literal(city), 'NULL') || ', ' || COALESCE(quote_literal(state), 'NULL') || ', ' || COALESCE(quote_literal(logo_url), 'NULL') || ', ' || COALESCE(quote_literal(primary_color), 'NULL') || ', ' || COALESCE(quote_literal(secondary_color), 'NULL') || ', ' || is_active || ', ' || quote_literal(created_at) || ', ' || quote_literal(updated_at)"
generate_table "areas" "$FILE" "id, name, description, created_at, created_by, church_id" "quote_literal(id) || ', ' || quote_literal(name) || ', ' || COALESCE(quote_literal(description), 'NULL') || ', ' || quote_literal(created_at) || ', ' || COALESCE(quote_literal(created_by), 'NULL') || ', ' || COALESCE(quote_literal(church_id), 'NULL')"
generate_table "communities" "$FILE" "id, area_id, name, created_at, created_by, church_id" "quote_literal(id) || ', ' || COALESCE(quote_literal(area_id), 'NULL') || ', ' || quote_literal(name) || ', ' || quote_literal(created_at) || ', ' || COALESCE(quote_literal(created_by), 'NULL') || ', ' || COALESCE(quote_literal(church_id), 'NULL')"

# Part 2: Profiles & Roles
FILE="public_data_part_02_profiles_roles.sql"
echo "-- Parte 02: Profiles e Roles" > "$FILE"
generate_table "profiles" "$FILE" "id, user_id, full_name, birth_date, phone, community, area, created_at, updated_at, father_name, mother_name, father_phone, mother_phone, address, turma_id, avatar_url, confirmation_year, email, whatsapp_number, whatsapp_validation_status, whatsapp_last_blocked_reason, whatsapp_last_blocked_at, role, enrollment_status, enrollment_status_updated_at, enrollment_status_updated_by, church_id, is_active" "quote_literal(id) || ', ' || quote_literal(user_id) || ', ' || quote_literal(full_name) || ', ' || COALESCE(quote_literal(birth_date::text), 'NULL') || ', ' || COALESCE(quote_literal(phone), 'NULL') || ', ' || COALESCE(quote_literal(community), 'NULL') || ', ' || COALESCE(quote_literal(area), 'NULL') || ', ' || quote_literal(created_at) || ', ' || quote_literal(updated_at) || ', ' || COALESCE(quote_literal(father_name), 'NULL') || ', ' || COALESCE(quote_literal(mother_name), 'NULL') || ', ' || COALESCE(quote_literal(father_phone), 'NULL') || ', ' || COALESCE(quote_literal(mother_phone), 'NULL') || ', ' || COALESCE(quote_literal(address), 'NULL') || ', ' || COALESCE(quote_literal(turma_id), 'NULL') || ', ' || COALESCE(quote_literal(avatar_url), 'NULL') || ', ' || COALESCE(confirmation_year::text, 'NULL') || ', ' || COALESCE(quote_literal(email), 'NULL') || ', ' || COALESCE(quote_literal(whatsapp_number), 'NULL') || ', ' || COALESCE(quote_literal(whatsapp_validation_status), 'NULL') || ', ' || COALESCE(quote_literal(whatsapp_last_blocked_reason), 'NULL') || ', ' || COALESCE(quote_literal(whatsapp_last_blocked_at::text), 'NULL') || ', ' || quote_literal(role) || ', ' || COALESCE(quote_literal(enrollment_status), 'NULL') || ', ' || COALESCE(quote_literal(enrollment_status_updated_at::text), 'NULL') || ', ' || COALESCE(quote_literal(enrollment_status_updated_by), 'NULL') || ', ' || COALESCE(quote_literal(church_id), 'NULL') || ', ' || is_active"
generate_table "user_roles" "$FILE" "id, user_id, role, admin_area, is_super, is_super_admin, church_id" "quote_literal(id) || ', ' || quote_literal(user_id) || ', ' || quote_literal(role) || ', ' || COALESCE(quote_literal(admin_area), 'NULL') || ', ' || is_super || ', ' || is_super_admin || ', ' || COALESCE(quote_literal(church_id), 'NULL')"

# Part 3: Courses & Lessons
FILE="public_data_part_03_courses_lessons.sql"
echo "-- Parte 03: Courses e Lessons" > "$FILE"
generate_table "courses" "$FILE" "id, order_num, title, subtitle, created_at, church_id" "quote_literal(id) || ', ' || order_num || ', ' || quote_literal(title) || ', ' || COALESCE(quote_literal(subtitle), 'NULL') || ', ' || quote_literal(created_at) || ', ' || COALESCE(quote_literal(church_id), 'NULL')"
generate_table "lessons" "$FILE" "id, course_id, order_num, title, objective, topics, created_at, devotional_mode, church_id" "quote_literal(id) || ', ' || quote_literal(course_id) || ', ' || order_num || ', ' || quote_literal(title) || ', ' || COALESCE(quote_literal(objective), 'NULL') || ', ' || COALESCE(quote_literal(topics), 'NULL') || ', ' || quote_literal(created_at) || ', ' || quote_literal(devotional_mode) || ', ' || COALESCE(quote_literal(church_id), 'NULL')"

# Part 4: Progress & Attendance
FILE="public_data_part_04_progress_attendance.sql"
echo "-- Parte 04: Progress e Attendance" > "$FILE"
generate_table "devotional_responses" "$FILE" "id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id" "quote_literal(id) || ', ' || quote_literal(user_id) || ', ' || quote_literal(devotional_id) || ', ' || question_index || ', ' || quote_literal(response) || ', ' || quote_literal(created_at) || ', ' || quote_literal(updated_at) || ', ' || COALESCE(quote_literal(church_id), 'NULL')"
generate_table "devotional_progress" "$FILE" "id, user_id, devotional_id, completed_at, is_recovery, awarded_points, override_release_id, church_id" "quote_literal(id) || ', ' || quote_literal(user_id) || ', ' || quote_literal(devotional_id) || ', ' || quote_literal(completed_at) || ', ' || is_recovery || ', ' || awarded_points || ', ' || COALESCE(quote_literal(override_release_id), 'NULL') || ', ' || COALESCE(quote_literal(church_id), 'NULL')"

