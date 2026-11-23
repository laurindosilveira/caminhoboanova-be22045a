# Exame estrutural das migracoes ausentes

Consulta do historico de producao em 08/11/2026: 83 versoes registradas e 213 arquivos locais sem a mesma versao. Os arquivos foram analisados como SQL PostgreSQL; nenhum apresentou erro de sintaxe pelo parser. A analise e estatica: funcoes, gatilhos e blocos dinamicos podem produzir efeitos nao enumerados. A presenca no historico nao prova identidade do arquivo e a ausencia nao prova que a mudanca falta.

Os hashes retratam o momento da triagem. A migracao nova 20261106221735 foi alterada posteriormente para substituir o bloqueio de tabelas por bloqueio por usuario e atividade; sua linha abaixo descreve a versao anterior, nao o arquivo revisado. Consultar `ATUALIZACAO_ESPECIFICA_SINCRONIZACAO.md` para a proposta atual.

Os nomes de operacoes abaixo sao indicios por arquivo; nao constituem autorizacao para executar, marcar como aplicado, nem conclusao de equivalencia com producao. DML em funcoes so ocorre quando chamadas; DML em blocos DO pode ocorrer durante a migracao. Os nomes localizados dentro de corpos foram identificados por padrao textual e podem incluir falsos positivos e omissoes. A migracao nova 20261106221735 aparece porque ainda nao foi aplicada em producao.

| Arquivo | SHA-256 (12 primeiros) | Operacoes no nivel principal | Escritas diretas / indicios dentro de corpos |
| --- | --- | --- | --- |
| 20260218222720_87534cd2-f34f-4588-8761-9f89ce4fda93.sql | 0b77d129c2fb | tipo enum (3), criar tabela (2), alterar tabela (2), criar/substituir funcao (4), criar politica (6), gatilho (2) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.user_roles |
| 20260218223510_c17f9999-73ca-416e-81cc-b008893bb45e.sql | b9d0c64de9b1 | criar tabela (2), alterar tabela (2), criar politica (5), criar/substituir funcao (1), remover objeto (1), inserir (1) | InsertStmt:public.activities |
| 20260218224200_858490cd-967b-43a9-a344-b63649d82ffe.sql | 5e2fbe3fa641 | criar/substituir funcao (1), remover objeto (1), gatilho (1) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.profiles |
| 20260218230534_f4100411-8793-4805-803f-9ab4459f5621.sql | 339645766f60 | criar/substituir funcao (1), criar politica (1) | nenhuma DML direta identificada |
| 20260219013840_5c8cd934-d3d2-4c0f-8134-3583dfacba52.sql | 4e6f72f59a46 | criar tabela (4), alterar tabela (4), criar politica (8), inserir (2) | InsertStmt:public.lessons, InsertStmt:public.courses, InsertStmt:public.lessons, InsertStmt:public.courses |
| 20260219014428_43e641b4-45d3-4b89-b3f4-7f1049e38241.sql | 228849c009e6 | criar tabela (2), alterar tabela (2), criar politica (4), gatilho (1) | nenhuma DML direta identificada |
| 20260219015057_69fd5674-29ed-4eed-9946-a037108f0549.sql | 58cda82f7c83 | alterar tabela (3), criar tabela (2), criar politica (3) | nenhuma DML direta identificada |
| 20260219020502_cfd74626-1cbc-4dc2-a837-f4a8ddc59716.sql | 080ee7da8145 | alterar tabela (2), criar tabela (1), criar politica (2), gatilho (1) | nenhuma DML direta identificada |
| 20260219021747_77b71c07-944e-4996-8e49-e570d8ca091d.sql | 2817ddb1ceac | criar tabela (1), alterar tabela (1), criar politica (2), criar/substituir funcao (1), gatilho (1) | nenhuma DML direta identificada |
| 20260219112907_a0d5229a-cc4f-4348-ab63-e401af5d721d.sql | accf7c7da412 | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260219124852_dea9804d-4797-40cb-9042-40e2a509a1ba.sql | 37624fab2b33 | criar tabela (3), alterar tabela (3), criar politica (9), AlterPublicationStmt (2) | nenhuma DML direta identificada |
| 20260219125501_45320fb8-dfd6-489e-af27-7d5858c0938a.sql | 87401da8fb7b | criar politica (1) | nenhuma DML direta identificada |
| 20260219125928_2847f2f1-d0ff-46cd-b40f-03c960758710.sql | 358841db5271 | alterar tabela (1) | nenhuma DML direta identificada |
| 20260223171358_a5ecb786-a242-4443-904d-bb5c72bcf502.sql | 4403070aac16 | criar tabela (1), alterar tabela (1), criar politica (1), gatilho (1) | nenhuma DML direta identificada |
| 20260223173137_be38265c-ddd9-4282-9eaf-c8025fd3fab2.sql | 824b18311fe1 | criar tabela (1), alterar tabela (1), criar politica (2), gatilho (1) | nenhuma DML direta identificada |
| 20260223174025_e33c9111-3b28-4401-9767-d98959a5424d.sql | 9593235af0f9 | alterar tabela (2), indice (1) | nenhuma DML direta identificada |
| 20260223174641_82948e61-d645-4550-9e1b-63fa5b9540b2.sql | 6edcd90bbeea | criar tabela (1), alterar tabela (1), criar politica (4) | nenhuma DML direta identificada |
| 20260223181016_50ccc6b7-8d2b-4ed6-b825-7811529ad892.sql | 8833374554af | extensao (2) | nenhuma DML direta identificada |
| 20260223183015_9e821325-b9e3-42fe-8aaf-08ca37cda3d0.sql | 45753567c0db | criar tabela (1), alterar tabela (1), criar politica (2), indice (1), criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260223191612_a0479d64-d164-4d34-84f4-564fade72030.sql | 56913a735a1e | alterar tabela (1), criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260223192143_b0153a7c-1de7-40a5-a8ef-e350a39a8133.sql | 79a2fcc6eb60 | criar tabela (1), alterar tabela (1), criar politica (5) | nenhuma DML direta identificada |
| 20260223192752_8be5338f-e958-44dd-8b0b-3c3d3a2be4b8.sql | 6ff5c24ab126 | alterar tabela (1) | nenhuma DML direta identificada |
| 20260223202736_231af3ff-27d7-44b6-89da-2d53eb6b4b93.sql | e1b8a17014f4 | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260223223828_a3560635-a718-4df3-8e2a-ea63c9558d0f.sql | 39be399c3224 | criar politica (1) | nenhuma DML direta identificada |
| 20260223224534_d06325f7-c4ab-43df-af16-3bedeb131030.sql | d8b29788410f | alterar tabela (1) | nenhuma DML direta identificada |
| 20260223231446_d77aeed6-a0e4-4ee2-9be8-1033237f74b9.sql | 5a6d254acca6 | criar tabela (1), alterar tabela (1), criar politica (3), gatilho (1) | nenhuma DML direta identificada |
| 20260223233616_a9cfbe8c-6902-4964-9231-dbea2f4d434e.sql | a39723108bb9 | alterar enum (1) | nenhuma DML direta identificada |
| 20260224112515_11e2591f-1333-4f73-90bd-f9693dbcc592.sql | 6193c9ccbadd | criar politica (2) | nenhuma DML direta identificada |
| 20260224112707_80e65dde-224d-4ade-8b7b-92eb0256b79f.sql | 77694c90cdb6 | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260224112959_3f7ae37c-0f83-4b59-9065-2d781b6f7d33.sql | d78c582c101d | criar politica (1) | nenhuma DML direta identificada |
| 20260224113409_35f0b931-f158-4566-891d-967a0d7c92b7.sql | 553177117406 | criar politica (4) | nenhuma DML direta identificada |
| 20260224123158_f68905df-a575-4315-9de6-5185e0c4db9f.sql | b1b45fb57d7c | inserir (1) | InsertStmt:public.user_roles |
| 20260224125601_66bcbc57-1e47-4c02-a15d-20cbbf7fa590.sql | 32d8266a52e3 | alterar tabela (1), criar politica (2) | nenhuma DML direta identificada |
| 20260224131834_99e4335d-dbc5-4cdd-aa94-53505c38f082.sql | 5d5745cf636d | criar tabela (1), alterar tabela (1), criar politica (3) | nenhuma DML direta identificada |
| 20260224132204_3dba7a57-79e5-4b0b-a615-4983196493d2.sql | 0c7542e979d7 | criar tabela (1), alterar tabela (1), criar politica (4) | nenhuma DML direta identificada |
| 20260224132424_78c96da3-c5fe-4976-ad57-d8dfa8fc2609.sql | ece98e9eff41 | criar tabela (2), alterar tabela (2), criar politica (6) | nenhuma DML direta identificada |
| 20260224132637_be19bd7d-56de-404d-a724-ca14cdb98872.sql | b00838a3ece1 | alterar tabela (1) | nenhuma DML direta identificada |
| 20260224133333_b1704d01-3670-4966-b680-91cbe1e80295.sql | ab60104705e4 | criar tabela (1), alterar tabela (1), criar politica (3) | nenhuma DML direta identificada |
| 20260224212419_8f29b4cf-92fa-4520-8847-2a8a0bdb3b84.sql | c7fb1137e1c7 | criar tabela (1), alterar tabela (1), criar politica (3) | nenhuma DML direta identificada |
| 20260224212535_87b83f46-43e5-4f79-988b-4a5655e8d1cc.sql | 2156a533c389 | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260225103854_a7442105-424b-4f9f-83cc-c7401099799b.sql | 65c462b5f62d | alterar tabela (1), criar/substituir funcao (2), remover objeto (15), criar politica (15) | nenhuma DML direta identificada |
| 20260225111749_1afd3b38-a5c6-4f36-a87b-7516c2d3a7ab.sql | 49f11623ca87 | alterar tabela (1) | nenhuma DML direta identificada |
| 20260225125545_3cee2d7f-f98c-4054-8e70-69c97454ff81.sql | 0c0dee93890d | alterar tabela (1) | nenhuma DML direta identificada |
| 20260225132508_90893e73-73bc-49fb-b5ad-4435d85e97ed.sql | 4ca00af756d5 | criar tabela (1), alterar tabela (2), criar politica (2) | nenhuma DML direta identificada |
| 20260225134442_e133a76c-deca-4691-95a0-084c482876af.sql | 78e042269b0d | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260226134655_2b5e7028-1328-49b6-8f6f-61660adf6ccd.sql | 4dbd3e13c162 | criar tabela (2), alterar tabela (2), criar politica (4), gatilho (1) | nenhuma DML direta identificada |
| 20260302132631_4cf7e7ef-a45a-43cf-9ab2-cdf61e6b2aef.sql | dacf4ab539c1 | criar tabela (1), alterar tabela (1), criar politica (4), gatilho (1) | nenhuma DML direta identificada |
| 20260302133436_19102896-0509-4164-8338-80b713e54871.sql | 067bee02656f | alterar tabela (1) | nenhuma DML direta identificada |
| 20260302135614_8e059cc4-1420-411f-9dc1-63edf639ebdc.sql | 06fa5d998aa0 | remover objeto (4), criar politica (4) | nenhuma DML direta identificada |
| 20260306102457_71787f18-a02b-4b3a-a781-11c60a58107d.sql | 0fed30e25a37 | criar tabela (1), alterar tabela (1), criar politica (2), gatilho (1) | nenhuma DML direta identificada |
| 20260309102156_f2cb68b1-07db-4847-b3e6-0c7b54657091.sql | dcd96075123d | alterar tabela (1), inserir (1), criar politica (4), criar/substituir funcao (1) | InsertStmt:storage.buckets; em corpos: INSERT INTO:public.profiles |
| 20260309105043_cbb4ea84-605d-41e3-9073-b301c1e3d3d4.sql | ab892fa46d70 | alterar tabela (2), criar tabela (1), criar politica (2) | nenhuma DML direta identificada |
| 20260309174505_c1ed25c7-f704-4a32-848b-4fe511093e5d.sql | c619d5eabf9e | criar politica (6) | nenhuma DML direta identificada |
| 20260309181134_bfb6a8be-2069-47ee-aa1f-474af8095a8c.sql | 80267f3e89a9 | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260309182601_cc78a5c3-b992-4a1b-9b21-a2384b8e7f45.sql | 17dc624e2bd4 | criar tabela (1), alterar tabela (1), criar politica (3) | nenhuma DML direta identificada |
| 20260309192848_b0decc2d-d03e-4d02-a3a6-0f9ecedb0b24.sql | 962aed4ab606 | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260309214146_17a879dc-4543-48d0-bf2c-dc536aabdfa3.sql | 4ffea6bf0eb1 | excluir (2) | DeleteStmt:public.user_roles, DeleteStmt:public.profiles |
| 20260309215849_389302de-7307-4809-9760-7a3479c6300d.sql | b6316d1a64fc | remover objeto (2), criar politica (2) | nenhuma DML direta identificada |
| 20260309220038_5e8b5f51-a0da-48a0-83a9-d6440531bbf8.sql | 94ffce40e453 | criar politica (1) | nenhuma DML direta identificada |
| 20260310181359_e37a94ef-f411-4295-8f8e-04cec15a051f.sql | 9816855d5ab3 | AlterPublicationStmt (1) | nenhuma DML direta identificada |
| 20260310192518_560be7a1-0d65-4bdf-b86d-5adf1dc360f5.sql | b4896938ff4e | criar/substituir funcao (1) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.profiles |
| 20260311214738_04a89023-2721-4a1d-8584-0deaeeebaf0d.sql | d2be76bb0799 | criar politica (2) | nenhuma DML direta identificada |
| 20260312003115_833cabc7-7c04-46f3-8f93-957fa4e03518.sql | b452a29ad6fa | alterar tabela (1), remover objeto (1), criar politica (1) | nenhuma DML direta identificada |
| 20260312105240_7fed1967-dd81-48ef-94fe-e78fac581f25.sql | 6d459b527170 | criar politica (2) | nenhuma DML direta identificada |
| 20260312110118_a50bbebf-15d4-4681-9203-3ab4e996b30d.sql | 4996719f0a7f | criar tabela (1), alterar tabela (1), criar politica (4) | nenhuma DML direta identificada |
| 20260312123440_3fdf5ef2-34bd-4da6-bb51-82d02989a291.sql | 6d6e88b8892a | criar tabela (1), alterar tabela (1), criar politica (3) | nenhuma DML direta identificada |
| 20260312182051_cc7db9eb-c26f-450f-8d82-6d75b3145b47.sql | 7a01dd745645 | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260312182336_7cdbecad-3661-4c8c-a290-9d7168a5f2a0.sql | 1de2a9572600 | alterar tabela (4), inserir (1), criar politica (3) | InsertStmt:storage.buckets |
| 20260313204203_976fe007-6c8a-4ff4-adea-923558570d33.sql | 05d9c6da4808 | alterar tabela (1), indice (1), criar/substituir funcao (1), atualizar (1) | UpdateStmt:public.profiles; em corpos: INSERT INTO:public.profiles, UPDATE:unknown.SET |
| 20260314231237_219350e4-8066-4943-8ed8-5b38a58ff699.sql | 881ffae78957 | criar tabela (1), alterar tabela (1), criar politica (2) | nenhuma DML direta identificada |
| 20260314231702_d0ae7ffe-0924-4bd1-bf60-aa5252502dfe.sql | ff988971346d | alterar tabela (1), criar politica (2) | nenhuma DML direta identificada |
| 20260314234544_860a1d45-84a9-41e5-88e0-ba9bdb2cdc78.sql | 1c44f9a858c1 | atualizar (1) | UpdateStmt:public.events |
| 20260316174029_28c48d75-085c-4c60-98af-841311c9a94e.sql | 8c63e2abb16e | criar tabela (2), alterar tabela (2), criar politica (6) | nenhuma DML direta identificada |
| 20260316174425_34c761fb-0de6-49c8-9e0c-255c1d17af7a.sql | 2ff80a8532c0 | alterar tabela (3) | nenhuma DML direta identificada |
| 20260316174929_db3e53b1-eeb8-40ae-a24a-dbd9864de27f.sql | 5f276c3aeeb2 | criar tabela (1), alterar tabela (1), criar politica (4) | nenhuma DML direta identificada |
| 20260316180305_852293ff-e2f9-4873-a34d-ce4b91311fdf.sql | 032b9dc3c2b0 | alterar tabela (1), inserir (1), criar politica (3) | InsertStmt:storage.buckets |
| 20260316183734_1d456a94-daec-423e-b18a-4d355fb59c5d.sql | 3ac0e721f6a7 | criar tabela (1), alterar tabela (1), criar politica (8), inserir (1) | InsertStmt:storage.buckets |
| 20260316185056_5404a35f-4354-477a-a966-1eb1582d2c3e.sql | 5d6c47ee7212 | criar politica (1) | nenhuma DML direta identificada |
| 20260316220133_d9a5d1ba-57ba-4002-a91a-d7a3b800d072.sql | 6e2b2832e093 | criar politica (1) | nenhuma DML direta identificada |
| 20260317203538_5449a812-f719-41ea-8a57-22cbf0a34100.sql | 4ae092605e8c | criar tabela (1), alterar tabela (1), criar politica (2) | nenhuma DML direta identificada |
| 20260330114330_create_system_update_log.sql | db3e76a1eb13 | criar tabela (1), alterar tabela (1), criar politica (2) | nenhuma DML direta identificada |
| 20260330114609_create_authorized_system_admins.sql | 6ad73f71ef1d | criar tabela (1), alterar tabela (1), criar politica (2), inserir (1) | InsertStmt:public.authorized_system_admins |
| 20260330173000_create_devotional_responses.sql | a86716ec0b46 | criar tabela (1), alterar tabela (1), criar politica (2), gatilho (1) | nenhuma DML direta identificada |
| 20260330193000_grant_leader_discipleship_access.sql | b1dd569a1625 | criar politica (12) | nenhuma DML direta identificada |
| 20260331120000_create_game_config.sql | 992d16fbf17f | criar tabela (1), alterar tabela (1), criar politica (2), inserir (1), gatilho (1), criar/substituir funcao (1) | InsertStmt:public.game_config |
| 20260401120000_push_automation_scheduled.sql | c0124698dbdb | criar tabela (2), alterar tabela (2), criar politica (3), gatilho (1), inserir (1) | InsertStmt:public.push_automation_config |
| 20260402120000_achievement_unlocks_leader_insert.sql | b023bf927af2 | criar politica (1) | nenhuma DML direta identificada |
| 20260402130000_create_bonus_grant_log.sql | 04b1a5ce1141 | criar tabela (1), alterar tabela (1), criar politica (3) | nenhuma DML direta identificada |
| 20260402150000_create_achievement_definitions.sql | aca72cf38aa4 | criar tabela (1), alterar tabela (1), criar politica (2), inserir (1) | InsertStmt:public.achievement_definitions |
| 20260402160000_achievement_definitions_production.sql | 44dfbf707db3 | criar tabela (1), alterar tabela (1), remover objeto (6), criar politica (4), inserir (1) | InsertStmt:public.achievement_definitions |
| 20260402170000_leader_delete_student_records.sql | 1079e245e1b8 | remover objeto (7), criar politica (8) | nenhuma DML direta identificada |
| 20260403120000_add_level_thresholds_to_game_config.sql | f08acc1d310c | inserir (1) | InsertStmt:public.game_config |
| 20260403130000_add_aptidao_thresholds_to_game_config.sql | a592fd85fe36 | inserir (1) | InsertStmt:public.game_config |
| 20260403140000_add_released_devotional_days_to_events.sql | 246cd586b302 | alterar tabela (1) | nenhuma DML direta identificada |
| 20260403150000_add_devotional_mode_and_recovery.sql | aaa6df7eca01 | alterar tabela (2), inserir (1) | InsertStmt:public.game_config |
| 20260404100000_create_custom_event_types.sql | aed4303ec6a1 | criar tabela (1), alterar tabela (1), criar politica (4) | nenhuma DML direta identificada |
| 20260405120000_create_user_devotional_overrides.sql | 7abef61df27b | criar tabela (1), bloco executavel (2), indice (2), remover objeto (5), gatilho (1), alterar tabela (2), criar politica (3), criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260407100000_leader_can_manage_own_turma.sql | 91a23618d8a7 | criar politica (2) | nenhuma DML direta identificada |
| 20260409113000_add_areas_communities_compat_rpc.sql | 530c57b8d7e6 | criar/substituir funcao (2), permissoes (4) | nenhuma DML direta identificada |
| 20260414120000_insert_jemiac_sabados_2026_area2.sql | 40dd547a6194 | inserir (1) | InsertStmt:public.events |
| 20260414130000_insert_cultos_martim_lutero_2026.sql | a6755dfd0352 | inserir (1) | InsertStmt:public.events |
| 20260414140000_fix_attendance_status_constraint.sql | 52f4fc75a6db | alterar tabela (2) | nenhuma DML direta identificada |
| 20260420153000_align_ranking_with_achievement_points.sql | d65bccdd3d48 | remover objeto (2), criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260420170000_allow_leader_read_achievement_unlocks.sql | ff75289a61c1 | criar politica (1) | nenhuma DML direta identificada |
| 20260430100000_revoke_anon_rpc_access.sql | 3dd790ac458a | permissoes (15) | nenhuma DML direta identificada |
| 20260430110000_fix_storage_policies.sql | 640d86eac5a4 | remover objeto (3), criar politica (4) | nenhuma DML direta identificada |
| 20260430120000_fix_poll_votes_rls.sql | 84bd0280e276 | remover objeto (1), criar politica (1) | nenhuma DML direta identificada |
| 20260430130000_rls_critical_tables_by_role.sql | 247158888cca | criar/substituir funcao (2), permissoes (4), remover objeto (45), criar politica (41) | nenhuma DML direta identificada |
| 20260430140000_create_bonus_removal_log.sql | fbcf1363b197 | criar tabela (1), alterar tabela (1), criar politica (3) | nenhuma DML direta identificada |
| 20260430150000_whatsapp_reminders.sql | fa8fa5ffc17b | alterar tabela (4), criar tabela (2), criar politica (4), inserir (1), gatilho (1), indice (2), criar/substituir funcao (4), permissoes (9) | InsertStmt:public.whatsapp_reminder_config |
| 20260430160000_cron_whatsapp_reminders.sql | 8fc2c2cf12d6 | SELECT executavel (2) | nenhuma DML direta identificada |
| 20260430170000_whatsapp_validation_status.sql | ec0b7ffac197 | alterar tabela (1), indice (1), criar/substituir funcao (1), permissoes (2) | nenhuma DML direta identificada; em corpos: UPDATE:public.profiles |
| 20260430180000_whatsapp_audit_improvements.sql | 6da451776905 | alterar tabela (1), indice (2), criar/substituir funcao (2), permissoes (4), remover objeto (1), criar politica (2) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.whatsapp_reminder_log, UPDATE:public.whatsapp_reminder_log |
| 20260430190000_revoke_anon_graphql_table_select.sql | a05efc542db0 | permissoes (3), permissoes padrao (3), bloco executavel (1) | nenhuma DML direta identificada |
| 20260430200000_restrict_storage_listing_by_reference.sql | e22ff698a66f | remover objeto (12), criar politica (5) | nenhuma DML direta identificada |
| 20260430210000_system_admin_authorization_rpc.sql | ea5034b06b6a | criar/substituir funcao (1), permissoes (2) | nenhuma DML direta identificada |
| 20260430220000_create_data_export_audit.sql | e465443d5b5b | criar tabela (1), alterar tabela (1), remover objeto (2), criar politica (2), indice (2) | nenhuma DML direta identificada |
| 20260430230000_create_privacy_requests.sql | 649564e98725 | criar tabela (1), alterar tabela (1), remover objeto (4), criar politica (3), indice (2), criar/substituir funcao (1), gatilho (1) | nenhuma DML direta identificada |
| 20260501090000_profile_enrollment_status.sql | 84f5691e970b | alterar tabela (3), atualizar (1), indice (1) | UpdateStmt:public.profiles |
| 20260502110000_birthday_push_automation.sql | f4d4612dfb10 | inserir (1) | InsertStmt:public.push_automation_config |
| 20260511120000_area_birthdays_and_push_cron.sql | a2690ccebb0c | criar/substituir funcao (1), permissoes (2), SELECT executavel (2) | nenhuma DML direta identificada |
| 20260511123000_scope_area_birthdays_by_requested_area.sql | 8f7ca4e3f599 | criar/substituir funcao (1), permissoes (2) | nenhuma DML direta identificada |
| 20260512183324_47164b07-346f-42ad-8b31-35b9d9c3a538.sql | b80439821dea | remover objeto (1), criar tabela (2), alterar tabela (2), criar politica (8), criar/substituir funcao (1), gatilho (2) | nenhuma DML direta identificada; em corpos: UPDATE:public.prayer_requests |
| 20260512185545_346caada-b856-4c5e-8b61-805b49c72af2.sql | c1fd591f09bb | alterar tabela (4), atualizar (1), criar/substituir funcao (3), remover objeto (12), gatilho (3), criar tabela (2), criar politica (7) | UpdateStmt:public.profiles; em corpos: INSERT INTO:public.notifications, UPDATE:public.profiles |
| 20260512190254_918a7e51-2c34-4201-ac04-8951f47203eb.sql | 4275bf3d1331 | remover objeto (15), alterar tabela (1), criar politica (4) | nenhuma DML direta identificada |
| 20260512194315_81fd7b7b-6fe8-493e-866f-0ab8332e5a3f.sql | 9d964fe631b2 | alterar tabela (6), indice (3) | nenhuma DML direta identificada |
| 20260512194401_cd71dc28-85a9-4df4-8596-eda7a2bba08b.sql | 4abdd95ecc59 | alterar tabela (3), indice (1) | nenhuma DML direta identificada |
| 20260512194517_fcd3d899-ea87-4b14-96e2-7f8e2189570f.sql | fbf2aae36174 | alterar tabela (3), indice (1) | nenhuma DML direta identificada |
| 20260512195820_a451969d-ee64-45d8-a92b-e4f60f827f59.sql | dfc7bcb36022 | criar tabela (1), alterar tabela (2), criar politica (2), criar/substituir funcao (1), gatilho (1) | nenhuma DML direta identificada |
| 20260512203849_ae957985-3a9e-49eb-8151-5990e34a18d0.sql | 86bbb24e63e6 | criar tabela (1), alterar tabela (1), criar politica (2), inserir (1) | InsertStmt:public.devotional_worship_songs |
| 20260512204618_fd821bbc-15dd-44aa-88f2-9763bf95a4a9.sql | 83ccd7ff7e57 | inserir (1), criar politica (4) | InsertStmt:storage.buckets |
| 20260512230830_ae6664d9-667d-4d6f-87d7-2051683f975c.sql | 9b6fd2b3cc01 | criar tabela (1), alterar tabela (1), bloco executavel (2), inserir (1), remover objeto (4), criar politica (3), criar/substituir funcao (1), gatilho (1) | InsertStmt:public.churches; em corpos: UPDATE:public.areas, UPDATE:public.communities, UPDATE:public.courses, UPDATE:public.messages, UPDATE:public.profiles |
| 20260512231746_e98f6eab-9f9c-4124-80b5-4e56ce7dc25f.sql | fd0def908d89 | atualizar (1), remover objeto (10), criar politica (10), criar/substituir funcao (1), alterar tabela (4) | UpdateStmt:public.profiles |
| 20260513125324_dd16fbf5-a660-4ac4-8aa5-995bab57dbc8.sql | 9a194cdd6bed | alterar enum (1) | nenhuma DML direta identificada |
| 20260513125353_209114ee-522e-4c54-b586-a5c5623e6d08.sql | 5fd641e66ade | alterar tabela (18), bloco executavel (1), criar/substituir funcao (2), remover objeto (18), criar politica (12) | nenhuma DML direta identificada; em corpos: UPDATE:public.achievement_unlocks, UPDATE:public.activities, UPDATE:public.attendance, UPDATE:public.custom_event_types, UPDATE:public.devotional_content, UPDATE:public.devotional_progress, UPDATE:public.events, UPDATE:public.lesson_content, UPDATE:public.lesson_responses, UPDATE:public.lessons, UPDATE:public.user_progress, UPDATE:public.worship_attendance |
| 20260513134038_ab414afd-1879-4f34-8a47-16cd54633945.sql | 473ededb9dbf | bloco executavel (1) | nenhuma DML direta identificada |
| 20260513184353_bb070994-f960-4547-9ca7-6afd3100d124.sql | 48b9686b49b9 | extensao (1), criar/substituir funcao (3), bloco executavel (3), alterar tabela (2), remover objeto (6), criar politica (6) | nenhuma DML direta identificada; em corpos: UPDATE:unknown.public |
| 20260513190000_multi_church_hardening.sql | 157f6b03a640 | extensao (1), criar/substituir funcao (3), bloco executavel (9), alterar tabela (2), remover objeto (6), criar politica (6) | nenhuma DML direta identificada; em corpos: UPDATE:public.area_pastors, UPDATE:public.areas, UPDATE:public.communities, UPDATE:public.community_challenges, UPDATE:public.community_settings, UPDATE:public.course_unlocks, UPDATE:public.custom_event_types, UPDATE:public.devotional_content, UPDATE:public.event_photos, UPDATE:public.events, UPDATE:public.lesson_content, UPDATE:public.message_reactions, UPDATE:public.message_views, UPDATE:public.messages, UPDATE:public.ranking_seasons, UPDATE:public.turmas, UPDATE:unknown.public, UPDATE:unknown.their |
| 20260513190050_e077422f-7870-4050-9e3b-33211ce4e79f.sql | ea714c2b1dda | alterar tabela (1), bloco executavel (2), atualizar (3), excluir (1), indice (1) | UpdateStmt:public.attendance, UpdateStmt:public.attendance, UpdateStmt:public.attendance, DeleteStmt:public.attendance |
| 20260513194351_b046055e-127b-4428-a201-ebacfd136cbd.sql | 9d26302a3b67 | bloco executavel (1) | nenhuma DML direta identificada |
| 20260513202518_2b0f28fa-ce6e-46fe-990b-73a22357118e.sql | f7e33270fa3d | criar tabela (1), alterar tabela (1), bloco executavel (2) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.leader_guide, INSERT INTO:public.lesson_content, UPDATE:unknown.SET, UPDATE:unknown.leader_guide, UPDATE:unknown.lesson_content |
| 20260513203000_attendance_confirmation_idempotency.sql | 19ad2d2d27d2 | alterar tabela (1), bloco executavel (2), atualizar (3), excluir (1), indice (1) | UpdateStmt:public.attendance, UpdateStmt:public.attendance, UpdateStmt:public.attendance, DeleteStmt:public.attendance |
| 20260514000756_1b17f5cc-7e98-4ace-a906-6e77e3fecefb.sql | 78144aef123a | alterar tabela (1), bloco executavel (1), indice (1), remover objeto (5), criar politica (3) | nenhuma DML direta identificada |
| 20260517155810_3c717b1f-8d7c-42cd-ae4b-fc9a5287e1b0.sql | 2aaeadd8f031 | alterar tabela (1), indice (2) | nenhuma DML direta identificada |
| 20260517161109_4eac9248-ed23-487b-86ed-820ab0d655cb.sql | 62f9e0172b1a | alterar tabela (2), indice (1) | nenhuma DML direta identificada |
| 20260517161347_00e34bc2-5034-4784-845f-56035c80ad5c.sql | 1d385298a8ba | criar tabela (1), alterar tabela (2), criar politica (2) | nenhuma DML direta identificada |
| 20260517162936_921efc75-bb20-47b3-8441-470f022c3c35.sql | fffd97a974fa | criar/substituir funcao (2), remover objeto (1), gatilho (1) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.stripe_webhook_logs, UPDATE:public.church_subscriptions, UPDATE:unknown.the |
| 20260517163011_2d383a9c-38cd-478a-b4da-39f1ecee6e3b.sql | d817dbba9460 | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260517163951_bac189ff-7d30-4168-aba1-eaa94fb64c71.sql | 955be055b7fe | criar tabela (1), alterar tabela (2), criar politica (1), criar/substituir funcao (1) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.church_audit_logs |
| 20260517165400_72a9511a-266c-419b-bd83-51ddbeba2703.sql | 6e31000e4842 | excluir (1), criar/substituir funcao (1) | DeleteStmt:public.authorized_system_admins |
| 20260517165421_0d998623-4d3c-4076-b010-8a7f728b9c12.sql | 85e9acebea32 | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260517165730_4cb52cc3-beb0-4745-b5e5-93cdca66d6e4.sql | cebac9f7819a | criar politica (1) | nenhuma DML direta identificada |
| 20260517170029_6aa73daa-cbd2-4644-bc20-b68b4b7b1b4d.sql | 4676dd922870 | criar tabela (1), alterar tabela (1), criar politica (1), criar/substituir funcao (2) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.system_admin_audit_logs, UPDATE:public.church_subscriptions |
| 20260517170923_932bc610-034d-4b15-81b7-41f8cf3cd4ce.sql | 11509fe57504 | remover objeto (4), criar tabela (1), alterar tabela (1), criar politica (1), bloco executavel (1), criar/substituir funcao (3) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.church_audit_logs, INSERT INTO:public.stripe_webhook_logs, INSERT INTO:public.system_admin_audit_logs, UPDATE:public.church_subscriptions, UPDATE:unknown.status, UPDATE:unknown.subscription |
| 20260517171557_0d857069-dcd5-42bd-bce7-164ef0c521f8.sql | e872a46fa005 | criar politica (2), criar/substituir funcao (1) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.church_audit_logs |
| 20260517180213_b4a7bc9f-cfe3-4095-92e1-7a6ed810b8b5.sql | f9523d439ad2 | criar tabela (1), alterar tabela (1), criar politica (2), criar/substituir funcao (1) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.login_audit_logs |
| 20260517183637_cf47dc41-d769-43d8-b888-6248a9a55a6b.sql | bfa6e476461e | criar tabela (1), alterar tabela (1), criar politica (3), criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260517183910_3439604c-e7e3-453b-a244-f20388de7057.sql | 24d4630b737c | criar/substituir funcao (1), remover objeto (1), gatilho (1), alterar funcao (3) | nenhuma DML direta identificada |
| 20260517185404_8abef530-3e82-4b1e-9dfa-12f3c6ed6031.sql | 5930d13705dc | criar/substituir funcao (1), permissoes (1), bloco executavel (1) | nenhuma DML direta identificada; em corpos: UPDATE:unknown.USING |
| 20260517190143_15b0d629-f905-4d24-92c4-ee54214e758d.sql | 394840d9b162 | remover objeto (2), alterar tabela (2), criar tabela (1), criar politica (1), criar/substituir funcao (3), permissoes (1) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.church_audit_logs, INSERT INTO:public.profession_of_faith_records, UPDATE:public.profiles |
| 20260517190738_2faf0a57-7d84-4d9a-b4f3-b2b8da024675.sql | 0529909de04e | criar tabela (1), alterar tabela (2), criar politica (1), criar/substituir funcao (1) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.blocked_registration_attempts |
| 20260517191044_3d0c6e54-623d-4f6d-b5b7-5d5e51539483.sql | 1af2e40f1b1f | criar/substituir funcao (2), permissoes (1), remover objeto (1), gatilho (1) | nenhuma DML direta identificada |
| 20260517191424_b3bd448c-48c6-49bd-b97c-35f0ae864dbb.sql | df5f5b7a4bd1 | alterar tabela (1), criar/substituir funcao (1) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.church_audit_logs, INSERT INTO:public.profession_of_faith_records, UPDATE:public.profiles |
| 20260519163158_0f9f7b0f-e30c-47e6-ae38-49eb6aed8031.sql | e4132886b7c5 | criar/substituir funcao (2), criar tabela (1), inserir (1) | InsertStmt:public.authorized_system_admins |
| 20260519163213_98ef6b73-a10e-4b82-b08e-8cc86bdc6b30.sql | 4db76647d32a | alterar funcao (2) | nenhuma DML direta identificada |
| 20260519163448_19a458bc-7feb-455f-8b56-15732ea36888.sql | aa7b9748f0ab | criar tabela (1), alterar tabela (1), criar/substituir funcao (2) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.system_settings, UPDATE:unknown.SET |
| 20260519163508_466118db-73bf-4f10-9adc-6788d95d2522.sql | 8f4956310c55 | extensao (1), alterar funcao (2) | nenhuma DML direta identificada |
| 20260519163525_bcdb5c6f-88ee-454c-9acd-c5a317e4bcc6.sql | 0974201a9785 | criar/substituir funcao (2) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.system_settings, UPDATE:unknown.SET |
| 20260519163547_27a98393-85a8-412b-becf-b92a5cd400d5.sql | f8638505a519 | criar/substituir funcao (2) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.system_settings, UPDATE:unknown.SET |
| 20260519210825_fef2df05-e205-4420-aa2d-8d3ffd2ef6ce.sql | e9a78cf1e3dd | criar tabela (1), alterar tabela (1), criar politica (1), criar/substituir funcao (1), remover objeto (1), gatilho (1) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.plan_history |
| 20260519212151_688801fc-3d20-4267-88e3-34dfe7b50e53.sql | db4aa12dce2d | CreateTableAsStmt (2) | nenhuma DML direta identificada |
| 20260519212224_a2099466-743c-4b82-873d-fa15552801fa.sql | 390cf94dcf72 | remover objeto (2) | nenhuma DML direta identificada |
| 20260519214417_0c8de006-c50c-4149-b756-3c072d655193.sql | 0d0067754b2b | criar tabela (1), esvaziar tabela (1), inserir (2) | TruncateStmt:public.temp_auth_export, InsertStmt:public.temp_auth_export, InsertStmt:public.temp_auth_export |
| 20260519214650_468dcf94-d036-458a-8b17-9f2ea3975cf1.sql | 715e2ff04c56 | remover objeto (1) | nenhuma DML direta identificada |
| 20260522160525_bd599fd2-e925-4da2-8c38-5951f8ef1de1.sql | 663a88fcb321 | remover objeto (1), criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260522171446_2ef703c9-5dde-4ba5-868a-e5b4af41d70a.sql | f4f511669752 | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260522171535_c0b7a0eb-c800-4715-8534-313b22dfb4a5.sql | 4f67ad715ca2 | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260522171647_c6246f97-e389-4392-abb6-5d42e1f2172c.sql | 3a388b61295d | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260522172038_b882bae4-e7bf-4fad-bfb3-62e5c13b0402.sql | 42f951b81efb | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260522173018_29eb7f51-0646-4c7e-a80a-fee96926b7e9.sql | 3bf2b275f031 | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260522173258_a3228739-6130-4adc-8698-da8b2930cff9.sql | 57d5a481a5e9 | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260522173658_c0a2b7a3-d9d8-4d08-8a13-3276e7536dfd.sql | 7a51aaad60b2 | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260522183227_578070d5-b93e-4027-a318-fbc65dd50769.sql | ae4e84fab40c | criar tabela (1), alterar tabela (1), criar politica (2), remover objeto (1), criar/substituir funcao (2) | nenhuma DML direta identificada; em corpos: UPDATE:unknown.a |
| 20260522212636_22d7d78b-a88a-4313-a776-a1703b21352a.sql | 358c2a03f582 | remover objeto (2), criar/substituir funcao (2) | nenhuma DML direta identificada |
| 20260522213616_6720f058-0727-41b5-92eb-a79a18b45c48.sql | 209959cc341e | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260522213851_233885b5-9884-4d1a-b2e7-6229d3498ed7.sql | d33de467996e | criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260626090000_ignore_blank_devotional_questions.sql | 000f6e763482 | atualizar (2), criar/substituir funcao (1), permissoes (1) | UpdateStmt:public.devotional_progress, UpdateStmt:public.devotional_responses; em corpos: INSERT INTO:public.devotional_progress, INSERT INTO:public.devotional_responses, UPDATE:unknown.SET |
| 20260626103000_autofill_user_church_id.sql | 3637deeec95e | criar/substituir funcao (2), bloco executavel (1) | nenhuma DML direta identificada; em corpos: UPDATE:unknown.OF |
| 20260626104500_ignore_blank_lesson_questions.sql | 67a5c71beaa6 | criar/substituir funcao (1), permissoes (1) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.lesson_progress, INSERT INTO:public.lesson_responses, UPDATE:unknown.SET |
| 20260704120000_ranking_participant_management.sql | a3f0aa97c2a0 | criar tabela (1), indice (1), alterar tabela (1), remover objeto (1), criar politica (1), permissoes (3), criar/substituir funcao (1), bloco executavel (1) | nenhuma DML direta identificada; em corpos: DELETE FROM:public.ranking_exclusions, INSERT INTO:public.ranking_exclusions, UPDATE:unknown.SET |
| 20260706120000_repair_natalia_attendance_scope.sql | 714555975410 | bloco executavel (2) | nenhuma DML direta identificada; em corpos: UPDATE:public.profiles |
| 20260713174249_insert_leader_guide_aula9_curso2.sql | c4783e607b63 | bloco executavel (1) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.leader_guide, INSERT INTO:public.lesson_content, UPDATE:public.leader_guide, UPDATE:unknown.SET |
| 20260713234058_update_aula9_curso2_devocionais.sql | 42d773982104 | inserir (1) | InsertStmt:public.devotional_content |
| 20260714124324_update_aula10_curso2_devocionais.sql | 336fde56a075 | inserir (1) | InsertStmt:public.devotional_content |
| 20260714124859_insert_leader_guide_aula10_curso2.sql | ed9bca4b905a | bloco executavel (1) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.leader_guide, INSERT INTO:public.lesson_content, UPDATE:public.leader_guide, UPDATE:unknown.SET |
| 20260714141940_insert_leader_guide_aula11_curso2.sql | 3ea0fa345c0a | bloco executavel (1) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.leader_guide, INSERT INTO:public.lesson_content, UPDATE:public.leader_guide, UPDATE:unknown.SET |
| 20260714142514_update_aula11_curso2_devocionais_links.sql | 8319d68f6d4a | inserir (1), atualizar (1) | InsertStmt:public.devotional_content, UpdateStmt:public.lesson_content |
| 20260714183000_add_course_modules_and_global_releases.sql | acc63c2e2ac6 | criar tabela (2), indice (3), bloco executavel (3), alterar tabela (3), permissoes (2), remover objeto (6), criar politica (6) | nenhuma DML direta identificada |
| 20260720215729_add_staging_performance_indexes.sql | a10dbea040b5 | bloco executavel (5), indice (96) | nenhuma DML direta identificada |
| 20260720220641_optimize_hot_tenant_rls_policies.sql | 1b80aa5d5539 | criar/substituir funcao (2), permissoes (3), bloco executavel (2), remover objeto (1) | nenhuma DML direta identificada; em corpos: UPDATE:unknown.to |
| 20260721210044_leader_care_dashboard.sql | 4bfd9b400b7f | criar tabela (1), alterar tabela (2), permissoes (10), indice (8), criar/substituir funcao (4) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.discipleship_plans, INSERT INTO:public.leader_follow_ups, UPDATE:public.leader_follow_ups, UPDATE:unknown.SET |
| 20260721212247_fix_leader_care_scope_authorization.sql | 5085fb76651b | AlterObjectSchemaStmt (1), permissoes (3), criar/substituir funcao (1) | nenhuma DML direta identificada |
| 20260721212700_finalize_leader_care_advisors.sql | 282d754f7d81 | remover objeto (1), criar politica (1), indice (4) | nenhuma DML direta identificada |
| 20260723012215_restore_avatar_storage.sql | f404c4e16d85 | inserir (1), remover objeto (4), criar politica (4) | InsertStmt:storage.buckets |
| 20260723013812_schedule_event_reminders.sql | 8faf25c44f6b | bloco executavel (1), SELECT executavel (1) | nenhuma DML direta identificada |
| 20260723014516_add_event_cron_secret_verifier.sql | 7c009ea434ec | criar/substituir funcao (1), permissoes (4) | nenhuma DML direta identificada |
| 20260723015335_exclude_elevated_roles_from_rankings.sql | 8365504f0573 | bloco executavel (1), permissoes (3) | nenhuma DML direta identificada |
| 20260724190000_create_caminho_3m_track.sql | 46ed72c85a71 | criar tabela (2), alterar tabela (3), bloco executavel (2), indice (2), permissoes (2), remover objeto (4), criar politica (4) | nenhuma DML direta identificada; em corpos: DELETE FROM:public.leader_guide, INSERT INTO:public.courses, INSERT INTO:public.leader_guide, INSERT INTO:public.learning_tracks, INSERT INTO:public.lesson_content, INSERT INTO:public.lessons, INSERT INTO:public.modules, INSERT INTO:public.track_church_releases, UPDATE:unknown.SET |
| 20260724211619_add_confirmatory_recovery_track.sql | 3ab4e01c4e5f | criar tabela (1), indice (4), alterar tabela (3), criar politica (1), criar/substituir funcao (2), permissoes (7) | nenhuma DML direta identificada; em corpos: INSERT INTO:public.confirmatory_recovery_releases, INSERT INTO:public.user_devotional_overrides, INSERT INTO:public.user_lesson_overrides, UPDATE:public.confirmatory_recovery_releases, UPDATE:public.user_devotional_overrides, UPDATE:public.user_lesson_overrides, UPDATE:unknown.set |
| 20260724223000_create_course_sales.sql | 337072045131 | criar tabela (5), alterar tabela (7), indice (3), permissoes (11), criar politica (12), criar/substituir funcao (2), remover objeto (2), inserir (2) | InsertStmt:public.course_products, InsertStmt:public.course_access_codes; em corpos: INSERT INTO:public.course_access_code_redemptions, INSERT INTO:public.user_course_entitlements, UPDATE:public.course_access_codes |
| 20260725010000_restrict_confirmatory_recovery_to_gc_schedule.sql | 6cd3e7cb447b | criar/substituir funcao (1), permissoes (2), atualizar (2) | UpdateStmt:public.user_lesson_overrides, UpdateStmt:public.user_devotional_overrides; em corpos: INSERT INTO:public.confirmatory_recovery_releases, INSERT INTO:public.user_devotional_overrides, INSERT INTO:public.user_lesson_overrides, UPDATE:public.confirmatory_recovery_releases, UPDATE:public.user_devotional_overrides, UPDATE:public.user_lesson_overrides, UPDATE:unknown.set |
| 20260725023000_limit_recovery_to_current_gc_course.sql | e44b66282b68 | criar/substituir funcao (3), remover objeto (2), gatilho (2), atualizar (2), permissoes (3) | UpdateStmt:public.user_lesson_overrides, UpdateStmt:public.user_devotional_overrides |
| 20261106221735_offline_response_conflict_guard.sql | 72129679615e | criar/substituir funcao (1), permissoes (2) | nenhuma DML direta identificada |
