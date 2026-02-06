-- Add profile_image column to bots table
ALTER TABLE bots ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Update profile images for all bots
UPDATE bots SET profile_image = '/profiles/worldcoin.png' WHERE id = 'worldcoin-expert';
UPDATE bots SET profile_image = '/profiles/seoul-guide.png' WHERE id = 'seoul-local-guide';
UPDATE bots SET profile_image = '/profiles/doctor.png' WHERE id = 'obgyn-specialist';
UPDATE bots SET profile_image = '/profiles/chef.png' WHERE id = 'korean-recipes';
UPDATE bots SET profile_image = '/profiles/startup-mentor.png' WHERE id = 'startup-mentor';
UPDATE bots SET profile_image = '/profiles/crypto-expert.png' WHERE id = 'crypto-expert';
UPDATE bots SET profile_image = '/profiles/kpop-insider.png' WHERE id = 'kpop-insider';
