-- Create database
-- Drop the database and recreate before running, if there's too many changes to make.
-- DROP DATABASE IF EXISTS habichew_db;
CREATE DATABASE IF NOT EXISTS habichew_db;
USE habichew_db;

-- Create any other tables your app needs

CREATE TABLE IF NOT EXISTS users (
 `id` integer PRIMARY KEY AUTO_INCREMENT,
 `email` varchar(255),
 `username` varchar(255),
 `password` varchar(255),
 `credits` integer DEFAULT 0,
 `tasks_num` integer,
 `petId` integer,
 `tasksNum` integer,
 `taskLastCompleted` timestamp DEFAULT CURRENT_TIMESTAMP,
-- Record created and updated time automatically
 `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
 `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Mood types for mood logs to enumerate
CREATE TABLE IF NOT EXISTS moodTypes(
    id INT PRIMARY KEY AUTO_INCREMENT,
    label VARCHAR(50) NOT NULL UNIQUE,
-- Optional hex code colours for display in frontend
    colorCode VARCHAR(7)
);

-- Insert into sample mood types table
INSERT INTO moodTypes (label, colorCode) VALUES
     ('Focused', '#B363E8'),
     ('Overwhelmed', '#ECECEC'),
     ('Unmotivated','#DAB7FF'),
     ('Distracted','#FF952C');

-- Mood logs for users
CREATE TABLE IF NOT EXISTS moodLogs (
    id integer PRIMARY KEY AUTO_INCREMENT,
    userId integer NOT NULL,
    moodTypeId integer NOT NULL,
-- Optional notes for the mood log
    note TEXT,
-- The date of the mood log
    moodDate DATE NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,


    CONSTRAINT fkUserMood FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fkMoodType FOREIGN KEY (moodTypeId) REFERENCES moodTypes(id),
-- The user can have one and only one mood log everyday
    UNIQUE(userId, moodDate)
);

CREATE TABLE IF NOT EXISTS pets (
    `id` integer PRIMARY KEY AUTO_INCREMENT,
    `name` varchar(255),
    `mood` varchar(255),
    `personality` varchar(255),
    `level` integer,
    `hunger` integer,
    `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample pets data
INSERT INTO pets (name, mood, personality, level)
VALUES
  ('henry', 'happy', 'calm', 1),
  ('filou', 'hungry', 'anxious', 1);

CREATE TABLE IF NOT EXISTS `habitCategories` (
 `id` integer PRIMARY KEY AUTO_INCREMENT,
 `name` varchar(255) NOT NULL
);

-- Insert sample habit_categories data
INSERT INTO habitCategories (name)
VALUES  ('Health'),
        ('Quit'),
        ('Hobbies'),
        ('Lifestyle'),
        ('Career'),
        ('Study'),
        ('Financial'),
        ('Custom');

CREATE TABLE IF NOT EXISTS `habits` (
    id integer PRIMARY KEY AUTO_INCREMENT,
    title varchar(255),
    categoryId integer,
    CONSTRAINT fkHabitCategory FOREIGN KEY (categoryId) REFERENCES habitCategories(id)
);
CREATE TABLE userHabits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    habitId INT,
    customTitle VARCHAR(255),
    priority INT,
    startDate DATETIME,
    goalDate DATETIME,
    frequency VARCHAR(20),        -- e.g., 'Daily', 'Weekly'
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

-- The habitId represents a preset habit, the customTitle represents a custom habit, so they cannot be NULL at the same time.
    CONSTRAINT chk_customTitle_if_no_habitId
        CHECK (
            habitId IS NOT NULL OR (habitId IS NULL AND customTitle IS NOT NULL)
            ),
    CONSTRAINT fkUserHabit FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
-- CONSTRAINT fkHabit FOREIGN KEY (habitId) REFERENCES habits(id)
);


CREATE TABLE IF NOT EXISTS `tasks` (
    `id` integer PRIMARY KEY AUTO_INCREMENT,
    `title` varchar(255) NOT NULL,
    `habitId` integer,
    `description` varchar(255)
);

CREATE TABLE IF NOT EXISTS `userTasks` (
   `id` integer PRIMARY KEY AUTO_INCREMENT,
   `customTitle` varchar(255),
   `taskId` integer,
   `userHabitId` integer NOT NULL ,
   `completed` boolean DEFAULT false,
   `description` varchar(255),
   `credit` INT,
   `priority` TEXT, -- low, medium, high
   `dueAt` DATETIME,
   `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
   `completedAt` DATETIME,

   CONSTRAINT chk_customTitle_if_no_taskId
       CHECK (
           taskId IS NOT NULL OR (taskId IS NULL AND customTitle IS NOT NULL)
           ),
   CONSTRAINT fkHabitTask FOREIGN KEY (userHabitId) REFERENCES userHabits(id) ON DELETE CASCADE
);

ALTER TABLE `users` ADD FOREIGN KEY (`petId`) REFERENCES `pets` (`id`);

ALTER TABLE `tasks` ADD FOREIGN KEY (`habitId`) REFERENCES `habits` (`id`);

-- Add your existing database schema here

-- Add data to the database

-- Insert sample users data

INSERT INTO users (username, email, password, petId)
VALUES
    ('john_doe',
     'john@example.com',
     '$2b$10$oLLIBsQbaByUKb8/U138uuItjNLWcf6jZFT8fXTTiEJxTKT.wRGD6', -- password = 'john'
     1),
    ('jane_smith',
     'jane@example.com',
     '$2b$10$i.lhKkpYxtxq5XmLt4Wpd.n9fuv7xmfVS6IGAr2UjPPfef411i6VC', -- password = 'jane'
     2);

-- Insert sample mood log data
INSERT INTO moodLogs (userId, moodTypeId, note, moodDate)
VALUES
    (1, 3, 'Felt a bit low today.', '2025-07-12'),
    (1,2,'','2025-07-13');


-- Insert sample user habit data
INSERT INTO userHabits (userId, habitId, customTitle, priority, startDate, goalDate, frequency)
VALUES
    (1,2,NULL,1, '2025-07-15','2025-08-15','Daily'),
    (1, NULL, 'Read philosophy', 2, '2025-07-16', '2025-09-16', 'Weekly'),
    (1, 5, 'Evening Yoga', 1, '2025-07-20', '2025-08-20', 'Daily'),
    (2, NULL, 'Digital Detox', 3, '2025-07-10', '2025-10-10', 'Weekly'),
    (2,1,NULL,2,'2025-07-20','2025-12-10',NULL);

-- Insert sample habits data
INSERT INTO habits (title, categoryId) VALUES
-- Health (1)
('Eat Healthy', 1),
('Drink Enough Water', 1),
('Eat Fruits', 1),
('Exercise', 1),
('Walk', 1),
('Run', 1),
('Stretch', 1),
('Meditation', 1),
('Yoga', 1),
('Cycling', 1),
('Swim', 1),

-- Quit (2)
('Smoking', 2),
('Vaping', 2),
('Coffee', 2),
('Drinking', 2),
('Junk Food', 2),
('Sugar', 2),
('Porn', 2),
('Social Media', 2),
('Carbonated Drinks', 2),
('Weed', 2),
('Drugs', 2),
('Swearing', 2),

-- Hobbies (3)
('Reading', 3),
('Drawing', 3),
('Play Music', 3),
('Photography', 3),
('Writing', 3),
('DIY Crafts', 3),

-- Lifestyle (4)
('Bedtime Routine', 4),
('Sleep Early', 4),
('Sleep 8 Hrs', 4),
('Wake Up Early', 4),
('Make My Bed', 4),
('Take a Shower', 4),
('Eat Breakfast', 4),

-- Career (5)
('Learn a Language', 5),
('Be Consistent', 5),
('Set Goals', 5),
('Be Productive', 5),
('New Project', 5),

-- Study (6)
('Study', 6),
('Review Notes', 6),
('Pomodoro Sessions', 6),

-- Financial (7)
('Track Expenses', 7),
('Budgeting', 7),
('Save Money', 7),
('No-Spend Day', 7),
('Invest Weekly', 7);

-- Insert sample tasks data
INSERT INTO tasks (title, habitId, description)
VALUES
    -- Habit 1: Eat healthy
    ('Identify unhealthy eating patterns', 1, ''),
    ('Research basic nutrition and food groups', 1, ''),
    ('Make a grocery list with healthy items', 1, ''),
    ('Remove junk food from your pantry', 1, ''),
    ('Prepare one healthy meal', 1, ''),
    ('Track what you eat for a day', 1, ''),
    ('Adjust portions and ingredients based on goals', 1, ''),
    ('Plan meals for the next 3 days', 1, ''),
    -- Habit 2: Drink Enough Water
    ('Calculate your ideal daily water intake', 2, ''),
    ('Get a reusable water bottle', 2, ''),
    ('Set reminders to drink hourly', 2, ''),
    ('Drink a full glass after waking', 2, ''),
    ('Replace one sugary drink with water', 2, ''),
    ('Track water intake today', 2, ''),
    ('Add fruits for flavored water', 2, ''),
    ('Keep bottle visible throughout the day', 2, ''),
    -- Habit 3: Sleep Early
    ('Set a fixed sleep schedule', 31, ''),
    ('Avoid caffeine after 2 PM', 31, ''),
    ('Create a relaxing bedtime routine', 31, ''),
    ('Turn off screens 1 hour before bed', 31, ''),
    ('Dim lights after sunset', 31, ''),
    ('Prepare for bed by 9:30 PM', 31, ''),
    ('Reflect on energy after early sleep', 31, ''),
    ('Repeat routine for three nights', 31, ''),
    -- Habit 4: Exercise
    ('Define what this habit means to you', 4, ''),
    ('Identify your current routine and gaps', 4, ''),
    ('Set a small, realistic starting goal', 4, ''),
    ('Create a reminder or schedule system', 4, ''),
    ('Do the habit once in a simple form', 4, ''),
    ('Track your progress for a day', 4, ''),
    ('Repeat habit three times this week', 4, ''),
    ('Reflect on benefits and adjust if needed', 4, ''),

    -- Habit 5: Walk
    ('Define what this habit means to you', 5, ''),
    ('Identify your current routine and gaps', 5, ''),
    ('Set a small, realistic starting goal', 5, ''),
    ('Create a reminder or schedule system', 5, ''),
    ('Do the habit once in a simple form', 5, ''),
    ('Track your progress for a day', 5, ''),
    ('Repeat habit three times this week', 5, ''),
    ('Reflect on benefits and adjust if needed', 5, ''),

    -- Habit 6: Run
    ('Define what this habit means to you', 6, ''),
    ('Identify your current routine and gaps', 6, ''),
    ('Set a small, realistic starting goal', 6, ''),
    ('Create a reminder or schedule system', 6, ''),
    ('Do the habit once in a simple form', 6, ''),
    ('Track your progress for a day', 6, ''),
    ('Repeat habit three times this week', 6, ''),
    ('Reflect on benefits and adjust if needed', 6, ''),

    -- Habit 7: Stretch
    ('Define what this habit means to you', 7, ''),
    ('Identify your current routine and gaps', 7, ''),
    ('Set a small, realistic starting goal', 7, ''),
    ('Create a reminder or schedule system', 7, ''),
    ('Do the habit once in a simple form', 7, ''),
    ('Track your progress for a day', 7, ''),
    ('Repeat habit three times this week', 7, ''),
    ('Reflect on benefits and adjust if needed', 7, ''),

    -- Habit 8: Meditation
    ('Define what this habit means to you', 8, ''),
    ('Identify your current routine and gaps', 8, ''),
    ('Set a small, realistic starting goal', 8, ''),
    ('Create a reminder or schedule system', 8, ''),
    ('Do the habit once in a simple form', 8, ''),
    ('Track your progress for a day', 8, ''),
    ('Repeat habit three times this week', 8, ''),
    ('Reflect on benefits and adjust if needed', 8, ''),

    -- Habit 9: Yoga
    ('Define what this habit means to you', 9, ''),
    ('Identify your current routine and gaps', 9, ''),
    ('Set a small, realistic starting goal', 9, ''),
    ('Create a reminder or schedule system', 9, ''),
    ('Do the habit once in a simple form', 9, ''),
    ('Track your progress for a day', 9, ''),
    ('Repeat habit three times this week', 9, ''),
    ('Reflect on benefits and adjust if needed', 9, ''),

    -- Habit 10: Cycling
    ('Define what this habit means to you', 10, ''),
    ('Identify your current routine and gaps', 10, ''),
    ('Set a small, realistic starting goal', 10, ''),
    ('Create a reminder or schedule system', 10, ''),
    ('Do the habit once in a simple form', 10, ''),
    ('Track your progress for a day', 10, ''),
    ('Repeat habit three times this week', 10, ''),
    ('Reflect on benefits and adjust if needed', 10, ''),

    -- Habit 11: Swim
    ('Define what this habit means to you', 11, ''),
    ('Identify your current routine and gaps', 11, ''),
    ('Set a small, realistic starting goal', 11, ''),
    ('Create a reminder or schedule system', 11, ''),
    ('Do the habit once in a simple form', 11, ''),
    ('Track your progress for a day', 11, ''),
    ('Repeat habit three times this week', 11, ''),
    ('Reflect on benefits and adjust if needed', 11, ''),

    -- Habit 12: Smoking
    ('Define what this habit means to you', 12, ''),
    ('Identify your current routine and gaps', 12, ''),
    ('Set a small, realistic starting goal', 12, ''),
    ('Create a reminder or schedule system', 12, ''),
    ('Do the habit once in a simple form', 12, ''),
    ('Track your progress for a day', 12, ''),
    ('Repeat habit three times this week', 12, ''),
    ('Reflect on benefits and adjust if needed', 12, ''),

    -- Habit 13: Vaping
    ('Define what this habit means to you', 13, ''),
    ('Identify your current routine and gaps', 13, ''),
    ('Set a small, realistic starting goal', 13, ''),
    ('Create a reminder or schedule system', 13, ''),
    ('Do the habit once in a simple form', 13, ''),
    ('Track your progress for a day', 13, ''),
    ('Repeat habit three times this week', 13, ''),
    ('Reflect on benefits and adjust if needed', 13, ''),

    -- Habit 14: Coffee
    ('Define what this habit means to you', 14, ''),
    ('Identify your current routine and gaps', 14, ''),
    ('Set a small, realistic starting goal', 14, ''),
    ('Create a reminder or schedule system', 14, ''),
    ('Do the habit once in a simple form', 14, ''),
    ('Track your progress for a day', 14, ''),
    ('Repeat habit three times this week', 14, ''),
    ('Reflect on benefits and adjust if needed', 14, ''),

    -- Habit 15: Drinking
    ('Define what this habit means to you', 15, ''),
    ('Identify your current routine and gaps', 15, ''),
    ('Set a small, realistic starting goal', 15, ''),
    ('Create a reminder or schedule system', 15, ''),
    ('Do the habit once in a simple form', 15, ''),
    ('Track your progress for a day', 15, ''),
    ('Repeat habit three times this week', 15, ''),
    ('Reflect on benefits and adjust if needed', 15, ''),

    -- Habit 16: Junk Food
    ('Define what this habit means to you', 16, ''),
    ('Identify your current routine and gaps', 16, ''),
    ('Set a small, realistic starting goal', 16, ''),
    ('Create a reminder or schedule system', 16, ''),
    ('Do the habit once in a simple form', 16, ''),
    ('Track your progress for a day', 16, ''),
    ('Repeat habit three times this week', 16, ''),
    ('Reflect on benefits and adjust if needed', 16, ''),

    -- Habit 17: Sugar
    ('Define what this habit means to you', 17, ''),
    ('Identify your current routine and gaps', 17, ''),
    ('Set a small, realistic starting goal', 17, ''),
    ('Create a reminder or schedule system', 17, ''),
    ('Do the habit once in a simple form', 17, ''),
    ('Track your progress for a day', 17, ''),
    ('Repeat habit three times this week', 17, ''),
    ('Reflect on benefits and adjust if needed', 17, ''),

    -- Habit 18: Playing the piano
    ('Define what this habit means to you', 18, ''),
    ('Identify your current routine and gaps', 18, ''),
    ('Set a small, realistic starting goal', 18, ''),
    ('Create a reminder or schedule system', 18, ''),
    ('Do the habit once in a simple form', 18, ''),
    ('Track your progress for a day', 18, ''),
    ('Repeat habit three times this week', 18, ''),
    ('Reflect on benefits and adjust if needed', 18, ''),

    -- Habit 19: Social Media
    ('Define what this habit means to you', 19, ''),
    ('Identify your current routine and gaps', 19, ''),
    ('Set a small, realistic starting goal', 19, ''),
    ('Create a reminder or schedule system', 19, ''),
    ('Do the habit once in a simple form', 19, ''),
    ('Track your progress for a day', 19, ''),
    ('Repeat habit three times this week', 19, ''),
    ('Reflect on benefits and adjust if needed', 19, ''),

    -- Habit 20: Carbonated Drinks
    ('Define what this habit means to you', 20, ''),
    ('Identify your current routine and gaps', 20, ''),
    ('Set a small, realistic starting goal', 20, ''),
    ('Create a reminder or schedule system', 20, ''),
    ('Do the habit once in a simple form', 20, ''),
    ('Track your progress for a day', 20, ''),
    ('Repeat habit three times this week', 20, ''),
    ('Reflect on benefits and adjust if needed', 20, ''),

    -- Habit 21: Weed
    ('Define what this habit means to you', 21, ''),
    ('Identify your current routine and gaps', 21, ''),
    ('Set a small, realistic starting goal', 21, ''),
    ('Create a reminder or schedule system', 21, ''),
    ('Do the habit once in a simple form', 21, ''),
    ('Track your progress for a day', 21, ''),
    ('Repeat habit three times this week', 21, ''),
    ('Reflect on benefits and adjust if needed', 21, ''),

    -- Habit 22: Drugs
    ('Define what this habit means to you', 22, ''),
    ('Identify your current routine and gaps', 22, ''),
    ('Set a small, realistic starting goal', 22, ''),
    ('Create a reminder or schedule system', 22, ''),
    ('Do the habit once in a simple form', 22, ''),
    ('Track your progress for a day', 22, ''),
    ('Repeat habit three times this week', 22, ''),
    ('Reflect on benefits and adjust if needed', 22, ''),

    -- Habit 23: Swearing
    ('Define what this habit means to you', 23, ''),
    ('Identify your current routine and gaps', 23, ''),
    ('Set a small, realistic starting goal', 23, ''),
    ('Create a reminder or schedule system', 23, ''),
    ('Do the habit once in a simple form', 23, ''),
    ('Track your progress for a day', 23, ''),
    ('Repeat habit three times this week', 23, ''),
    ('Reflect on benefits and adjust if needed', 23, ''),

    -- Habit 24: Reading
    ('Define what this habit means to you', 24, ''),
    ('Identify your current routine and gaps', 24, ''),
    ('Set a small, realistic starting goal', 24, ''),
    ('Create a reminder or schedule system', 24, ''),
    ('Do the habit once in a simple form', 24, ''),
    ('Track your progress for a day', 24, ''),
    ('Repeat habit three times this week', 24, ''),
    ('Reflect on benefits and adjust if needed', 24, ''),

    -- Habit 25: Drawing
    ('Define what this habit means to you', 25, ''),
    ('Identify your current routine and gaps', 25, ''),
    ('Set a small, realistic starting goal', 25, ''),
    ('Create a reminder or schedule system', 25, ''),
    ('Do the habit once in a simple form', 25, ''),
    ('Track your progress for a day', 25, ''),
    ('Repeat habit three times this week', 25, ''),
    ('Reflect on benefits and adjust if needed', 25, ''),

    -- Habit 26: Play Music
    ('Define what this habit means to you', 26, ''),
    ('Identify your current routine and gaps', 26, ''),
    ('Set a small, realistic starting goal', 26, ''),
    ('Create a reminder or schedule system', 26, ''),
    ('Do the habit once in a simple form', 26, ''),
    ('Track your progress for a day', 26, ''),
    ('Repeat habit three times this week', 26, ''),
    ('Reflect on benefits and adjust if needed', 26, ''),

    -- Habit 27: Photography
    ('Define what this habit means to you', 27, ''),
    ('Identify your current routine and gaps', 27, ''),
    ('Set a small, realistic starting goal', 27, ''),
    ('Create a reminder or schedule system', 27, ''),
    ('Do the habit once in a simple form', 27, ''),
    ('Track your progress for a day', 27, ''),
    ('Repeat habit three times this week', 27, ''),
    ('Reflect on benefits and adjust if needed', 27, ''),

    -- Habit 28: Writing
    ('Define what this habit means to you', 28, ''),
    ('Identify your current routine and gaps', 28, ''),
    ('Set a small, realistic starting goal', 28, ''),
    ('Create a reminder or schedule system', 28, ''),
    ('Do the habit once in a simple form', 28, ''),
    ('Track your progress for a day', 28, ''),
    ('Repeat habit three times this week', 28, ''),
    ('Reflect on benefits and adjust if needed', 28, ''),

    -- Habit 29: DIY Crafts
    ('Define what this habit means to you', 29, ''),
    ('Identify your current routine and gaps', 29, ''),
    ('Set a small, realistic starting goal', 29, ''),
    ('Create a reminder or schedule system', 29, ''),
    ('Do the habit once in a simple form', 29, ''),
    ('Track your progress for a day', 29, ''),
    ('Repeat habit three times this week', 29, ''),
    ('Reflect on benefits and adjust if needed', 29, ''),

    -- Habit 30: Bedtime Routine
    ('Define what this habit means to you', 30, ''),
    ('Identify your current routine and gaps', 30, ''),
    ('Set a small, realistic starting goal', 30, ''),
    ('Create a reminder or schedule system', 30, ''),
    ('Do the habit once in a simple form', 30, ''),
    ('Track your progress for a day', 30, ''),
    ('Repeat habit three times this week', 30, ''),
    ('Reflect on benefits and adjust if needed', 30, ''),

    -- Habit 31: Sleep Early
    ('Define what this habit means to you', 31, ''),
    ('Identify your current routine and gaps', 31, ''),
    ('Set a small, realistic starting goal', 31, ''),
    ('Create a reminder or schedule system', 31, ''),
    ('Do the habit once in a simple form', 31, ''),
    ('Track your progress for a day', 31, ''),
    ('Repeat habit three times this week', 31, ''),
    ('Reflect on benefits and adjust if needed', 31, ''),

    -- Habit 32: Sleep 8 Hrs
    ('Define what this habit means to you', 32, ''),
    ('Identify your current routine and gaps', 32, ''),
    ('Set a small, realistic starting goal', 32, ''),
    ('Create a reminder or schedule system', 32, ''),
    ('Do the habit once in a simple form', 32, ''),
    ('Track your progress for a day', 32, ''),
    ('Repeat habit three times this week', 32, ''),
    ('Reflect on benefits and adjust if needed', 32, ''),

    -- Habit 33: Wake Up Early
    ('Define what this habit means to you', 33, ''),
    ('Identify your current routine and gaps', 33, ''),
    ('Set a small, realistic starting goal', 33, ''),
    ('Create a reminder or schedule system', 33, ''),
    ('Do the habit once in a simple form', 33, ''),
    ('Track your progress for a day', 33, ''),
    ('Repeat habit three times this week', 33, ''),
    ('Reflect on benefits and adjust if needed', 33, ''),

    -- Habit 34: Make My Bed
    ('Define what this habit means to you', 34, ''),
    ('Identify your current routine and gaps', 34, ''),
    ('Set a small, realistic starting goal', 34, ''),
    ('Create a reminder or schedule system', 34, ''),
    ('Do the habit once in a simple form', 34, ''),
    ('Track your progress for a day', 34, ''),
    ('Repeat habit three times this week', 34, ''),
    ('Reflect on benefits and adjust if needed', 34, ''),

    -- Habit 35: Take a Shower
    ('Define what this habit means to you', 35, ''),
    ('Identify your current routine and gaps', 35, ''),
    ('Set a small, realistic starting goal', 35, ''),
    ('Create a reminder or schedule system', 35, ''),
    ('Do the habit once in a simple form', 35, ''),
    ('Track your progress for a day', 35, ''),
    ('Repeat habit three times this week', 35, ''),
    ('Reflect on benefits and adjust if needed', 35, ''),

    -- Habit 36: Eat Breakfast
    ('Define what this habit means to you', 36, ''),
    ('Identify your current routine and gaps', 36, ''),
    ('Set a small, realistic starting goal', 36, ''),
    ('Create a reminder or schedule system', 36, ''),
    ('Do the habit once in a simple form', 36, ''),
    ('Track your progress for a day', 36, ''),
    ('Repeat habit three times this week', 36, ''),
    ('Reflect on benefits and adjust if needed', 36, ''),

    -- Habit 37: Learn a Language
    ('Define what this habit means to you', 37, ''),
    ('Identify your current routine and gaps', 37, ''),
    ('Set a small, realistic starting goal', 37, ''),
    ('Create a reminder or schedule system', 37, ''),
    ('Do the habit once in a simple form', 37, ''),
    ('Track your progress for a day', 37, ''),
    ('Repeat habit three times this week', 37, ''),
    ('Reflect on benefits and adjust if needed', 37, ''),

    -- Habit 38: Be Consistent
    ('Define what this habit means to you', 38, ''),
    ('Identify your current routine and gaps', 38, ''),
    ('Set a small, realistic starting goal', 38, ''),
    ('Create a reminder or schedule system', 38, ''),
    ('Do the habit once in a simple form', 38, ''),
    ('Track your progress for a day', 38, ''),
    ('Repeat habit three times this week', 38, ''),
    ('Reflect on benefits and adjust if needed', 38, ''),

    -- Habit 39: Set Goals
    ('Define what this habit means to you', 39, ''),
    ('Identify your current routine and gaps', 39, ''),
    ('Set a small, realistic starting goal', 39, ''),
    ('Create a reminder or schedule system', 39, ''),
    ('Do the habit once in a simple form', 39, ''),
    ('Track your progress for a day', 39, ''),
    ('Repeat habit three times this week', 39, ''),
    ('Reflect on benefits and adjust if needed', 39, ''),

    -- Habit 40: Be Productive
    ('Define what this habit means to you', 40, ''),
    ('Identify your current routine and gaps', 40, ''),
    ('Set a small, realistic starting goal', 40, ''),
    ('Create a reminder or schedule system', 40, ''),
    ('Do the habit once in a simple form', 40, ''),
    ('Track your progress for a day', 40, ''),
    ('Repeat habit three times this week', 40, ''),
    ('Reflect on benefits and adjust if needed', 40, ''),

    -- Habit 41: New Project
    ('Define what this habit means to you', 41, ''),
    ('Identify your current routine and gaps', 41, ''),
    ('Set a small, realistic starting goal', 41, ''),
    ('Create a reminder or schedule system', 41, ''),
    ('Do the habit once in a simple form', 41, ''),
    ('Track your progress for a day', 41, ''),
    ('Repeat habit three times this week', 41, ''),
    ('Reflect on benefits and adjust if needed', 41, ''),

    -- Habit 42: Study
    ('Define what this habit means to you', 42, ''),
    ('Identify your current routine and gaps', 42, ''),
    ('Set a small, realistic starting goal', 42, ''),
    ('Create a reminder or schedule system', 42, ''),
    ('Do the habit once in a simple form', 42, ''),
    ('Track your progress for a day', 42, ''),
    ('Repeat habit three times this week', 42, ''),
    ('Reflect on benefits and adjust if needed', 42, ''),

    -- Habit 43: Review Notes
    ('Define what this habit means to you', 43, ''),
    ('Identify your current routine and gaps', 43, ''),
    ('Set a small, realistic starting goal', 43, ''),
    ('Create a reminder or schedule system', 43, ''),
    ('Do the habit once in a simple form', 43, ''),
    ('Track your progress for a day', 43, ''),
    ('Repeat habit three times this week', 43, ''),
    ('Reflect on benefits and adjust if needed', 43, ''),

    -- Habit 44: Pomodoro Sessions
    ('Define what this habit means to you', 44, ''),
    ('Identify your current routine and gaps', 44, ''),
    ('Set a small, realistic starting goal', 44, ''),
    ('Create a reminder or schedule system', 44, ''),
    ('Do the habit once in a simple form', 44, ''),
    ('Track your progress for a day', 44, ''),
    ('Repeat habit three times this week', 44, ''),
    ('Reflect on benefits and adjust if needed', 44, ''),

    -- Habit 45: Track Expenses
    ('Define what this habit means to you', 45, ''),
    ('Identify your current routine and gaps', 45, ''),
    ('Set a small, realistic starting goal', 45, ''),
    ('Create a reminder or schedule system', 45, ''),
    ('Do the habit once in a simple form', 45, ''),
    ('Track your progress for a day', 45, ''),
    ('Repeat habit three times this week', 45, ''),
    ('Reflect on benefits and adjust if needed', 45, ''),

    -- Habit 46: Budgeting
    ('Define what this habit means to you', 46, ''),
    ('Identify your current routine and gaps', 46, ''),
    ('Set a small, realistic starting goal', 46, ''),
    ('Create a reminder or schedule system', 46, ''),
    ('Do the habit once in a simple form', 46, ''),
    ('Track your progress for a day', 46, ''),
    ('Repeat habit three times this week', 46, ''),
    ('Reflect on benefits and adjust if needed', 46, ''),

    -- Habit 47: Save Money
    ('Define what this habit means to you', 47, ''),
    ('Identify your current routine and gaps', 47, ''),
    ('Set a small, realistic starting goal', 47, ''),
    ('Create a reminder or schedule system', 47, ''),
    ('Do the habit once in a simple form', 47, ''),
    ('Track your progress for a day', 47, ''),
    ('Repeat habit three times this week', 47, ''),
    ('Reflect on benefits and adjust if needed', 47, ''),

    -- Habit 48: No-Spend Day
    ('Define what this habit means to you', 48, ''),
    ('Identify your current routine and gaps', 48, ''),
    ('Set a small, realistic starting goal', 48, ''),
    ('Create a reminder or schedule system', 48, ''),
    ('Do the habit once in a simple form', 48, ''),
    ('Track your progress for a day', 48, ''),
    ('Repeat habit three times this week', 48, ''),
    ('Reflect on benefits and adjust if needed', 48, ''),

    -- Habit 49: Invest Weekly
    ('Define what this habit means to you', 49, ''),
    ('Identify your current routine and gaps', 49, ''),
    ('Set a small, realistic starting goal', 49, ''),
    ('Create a reminder or schedule system', 49, ''),
    ('Do the habit once in a simple form', 49, ''),
    ('Track your progress for a day', 49, ''),
    ('Repeat habit three times this week', 49, ''),
    ('Reflect on benefits and adjust if needed', 49, '');

-- Insert sample userTasks data
INSERT INTO userTasks (userHabitId, customTitle, taskId, description, credit, priority, dueAt)
VALUES (5,
        'Look through Youtube for knowledge on nutrition',
        1,
        '',
        50,
        'medium',
        '2026-01-01'),
       (1,
        NULL,
        10,
        '',
        50,
        'high',
        '2025-07-10'),
       (2,
        'Learn more about Wittgenstein',
        NULL,
        'A simple and modern logic structure might be helpful.',
        50,
        'low',
        '2025-08-10');
