-- Rename 한식 레시피 마스터 → 조림 마스터
UPDATE bots SET
  name = '조림 마스터',
  description = '최강록 셰프의 조림 비법과 한식 요리 노하우'
WHERE id = 'korean-recipes';
