# Requirements Document

## Introduction

WordPal is a web application that teaches English by allowing learners to visually build sentences using drag-and-drop grammar blocks. Instead of memorizing vocabulary lists, learners construct grammatically correct sentences by arranging color-coded blocks representing different parts of speech (subjects, verbs, objects, modifiers). An AI assistant powered by Amazon Bedrock provides real-time feedback on sentence correctness and suggests improvements.

This is an MVP designed for an AWS Hackathon (48-hour build window), optimized for demo value and judge impression.

## Glossary

- **Grammar_Block**: A draggable UI element representing a word or phrase, color-coded by grammatical role (subject, verb, object, modifier)
- **Sentence_Canvas**: The drop zone where learners arrange Grammar_Blocks to construct sentences
- **Exercise**: A single sentence-building challenge with a target sentence structure and available Grammar_Blocks
- **Lesson**: A collection of Exercises grouped by grammatical concept and difficulty level
- **AI_Feedback_Engine**: The backend service that uses Amazon Bedrock to evaluate constructed sentences and provide feedback
- **Progress_Tracker**: The system component that records user completion status and scores
- **Auth_Service**: The authentication layer powered by Supabase Auth
- **App**: The WordPal web application as a whole

## Requirements

### Requirement 1: Drag-and-Drop Sentence Building [MVP-Critical]

**User Story:** As a language learner, I want to drag grammar blocks onto a sentence canvas, so that I can visually construct English sentences without typing.

#### Acceptance Criteria

1. WHEN a learner drags a Grammar_Block and drops it on the Sentence_Canvas, THE Sentence_Canvas SHALL place the block at the horizontal drop position relative to existing blocks, inserting it between adjacent blocks or at the end if dropped past the last block
2. WHEN a Grammar_Block is placed on the Sentence_Canvas, THE App SHALL display the block in its color-coded grammatical category (subject: blue, verb: red, object: green, modifier: yellow)
3. WHEN a learner reorders Grammar_Blocks on the Sentence_Canvas, THE Sentence_Canvas SHALL update the sentence preview within 100ms of the drop completing
4. WHEN a learner removes a Grammar_Block from the Sentence_Canvas, THE App SHALL return the block to the available blocks area in its original position
5. WHEN one or more Grammar_Blocks are present on the Sentence_Canvas, THE App SHALL display the constructed sentence as a text string above the Sentence_Canvas by concatenating block labels in left-to-right order separated by spaces
6. WHEN a learner taps or clicks a Grammar_Block on a touch device, THE App SHALL place it at the rightmost position on the Sentence_Canvas
7. IF a learner drops a Grammar_Block outside the Sentence_Canvas boundaries, THEN THE App SHALL cancel the drag operation and return the block to its original position
8. IF the Sentence_Canvas contains 15 Grammar_Blocks and a learner attempts to add another block, THEN THE App SHALL reject the placement and display a message indicating the maximum block limit has been reached

### Requirement 2: AI-Powered Sentence Feedback [MVP-Critical]

**User Story:** As a language learner, I want AI feedback on my constructed sentences, so that I can understand whether my sentence is grammatically correct and how to improve it.

#### Acceptance Criteria

1. WHEN a learner submits a constructed sentence, THE AI_Feedback_Engine SHALL evaluate the sentence for grammatical correctness and return feedback within 3 seconds of submission
2. WHEN a sentence is grammatically correct, THE AI_Feedback_Engine SHALL return a success indicator and a brief positive message of no more than 2 sentences
3. WHEN a sentence is grammatically incorrect, THE AI_Feedback_Engine SHALL return a correctness indicator, an identification of the grammatical error type, and a suggested corrected version of the sentence
4. THE AI_Feedback_Engine SHALL use Amazon Bedrock foundation models to generate feedback
5. IF the Amazon Bedrock service is unavailable or does not respond within 3 seconds, THEN THE AI_Feedback_Engine SHALL display a message indicating temporary unavailability and present a retry button allowing the learner to resubmit the same sentence
6. WHEN providing feedback, THE AI_Feedback_Engine SHALL use vocabulary and sentence structures at or below a CEFR B1 (intermediate) level so that learners can understand the explanation
7. IF the learner submits an empty input or an input exceeding 200 characters, THEN THE AI_Feedback_Engine SHALL reject the submission and display a message indicating the input length constraint

### Requirement 3: Lesson and Exercise Structure [MVP-Critical]

**User Story:** As a language learner, I want structured exercises with progressive difficulty, so that I can build my grammar skills incrementally.

#### Acceptance Criteria

1. THE App SHALL provide at least 3 Lessons covering basic English sentence structures (simple present, simple past, questions)
2. EACH Lesson SHALL contain at least 5 Exercises ordered by increasing number of Grammar_Blocks required to form the target sentence
3. WHEN a learner arranges all Grammar_Blocks in a correct order matching the target sentence, THE App SHALL mark the Exercise as completed and unlock the next Exercise in the Lesson
4. WHEN a learner opens a Lesson, THE App SHALL display the Exercise list showing each Exercise's status as one of: locked, available, or completed
5. THE App SHALL present only the Grammar_Blocks needed to form the target sentence for each Exercise, plus no more than 3 distractor blocks
6. WHEN a learner completes all Exercises in a Lesson, THE App SHALL display a Lesson completion summary showing the number of Exercises completed on the first attempt out of total Exercises
7. IF a learner arranges Grammar_Blocks in an incorrect order, THEN THE App SHALL indicate which blocks are incorrectly placed and allow the learner to rearrange and resubmit without limit
8. WHEN a learner opens a Lesson for the first time, THE App SHALL set the first Exercise to available and all subsequent Exercises to locked

### Requirement 4: User Authentication [MVP-Critical]

**User Story:** As a language learner, I want to sign in to the application, so that my progress is saved across sessions.

#### Acceptance Criteria

1. WHEN a learner submits the registration form with a valid email address and a password of at least 8 characters, THE Auth_Service SHALL create a new account and sign the learner in
2. WHEN a learner submits the sign-in form with a registered email and correct password, THE Auth_Service SHALL authenticate the learner and redirect to the application home page
3. IF a learner attempts to access a protected page without an active session, THEN THE App SHALL redirect the learner to the sign-in page
4. IF authentication fails due to invalid credentials, THEN THE Auth_Service SHALL display an error message indicating that the email or password is incorrect without revealing which field is wrong
5. THE Auth_Service SHALL use Supabase Auth as the authentication provider
6. WHEN a learner signs out, THE App SHALL clear the session and redirect to the sign-in page
7. IF a learner attempts to register with an email address that is already associated with an existing account, THEN THE Auth_Service SHALL display an error message indicating that the email is already in use

### Requirement 5: Progress Tracking [MVP-Critical]

**User Story:** As a language learner, I want to see my learning progress, so that I can track how far I have come and stay motivated.

#### Acceptance Criteria

1. WHEN a learner completes an Exercise, THE Progress_Tracker SHALL record the completion status and score (integer from 0 to 100 representing percentage of correct answers) in Supabase associated with the authenticated user
2. WHEN a learner navigates to the progress dashboard, THE App SHALL display a list of all Lessons showing, for each Lesson, the lesson title, the count of completed Exercises out of total Exercises, and the overall lesson completion percentage
3. WHEN a learner revisits the application, THE Progress_Tracker SHALL restore the learner's position to the last Exercise they completed, navigating them to the next incomplete Exercise in the curriculum
4. THE App SHALL display a progress bar for each Lesson representing the percentage of Exercises completed out of the total number of Exercises in that Lesson (0% when no Exercises are completed, 100% when all Exercises are completed)
5. IF the Progress_Tracker fails to save completion data to Supabase, THEN THE App SHALL display an error message indicating the progress was not saved and SHALL retain the learner's input so they can retry without re-entering responses

### Requirement 6: Polished Demo UI [MVP-Critical]

**User Story:** As a hackathon presenter, I want a visually polished and responsive interface, so that judges are impressed by the application's quality and usability.

#### Acceptance Criteria

1. THE App SHALL use Tailwind CSS for all styling to ensure a consistent design system
2. THE App SHALL be responsive and functional on screen widths from 768px to 1920px, with no horizontal scrollbar, no overlapping elements, and no text truncation that hides meaning
3. WHEN a Grammar_Block is dragged, THE App SHALL display a drag animation at a minimum of 30 frames per second with a visible drop shadow, and the block SHALL follow the pointer position without perceptible lag
4. THE App SHALL display a branded landing page containing the WordPal logo, a tagline, and a call-to-action button that navigates the user to the main activity screen
5. WHEN the AI_Feedback_Engine returns a result, THE App SHALL animate the feedback appearance with a fade-in transition lasting between 200ms and 500ms
6. THE App SHALL apply a defined set of spacing values, a single type scale, and a unified color palette across all screens such that no screen uses ad-hoc values outside the Tailwind theme configuration
7. WHILE the AI_Feedback_Engine is processing a request, THE App SHALL display a visible loading indicator in the feedback area until a result or error is returned

### Requirement 7: Hint System [Optional/Stretch]

**User Story:** As a language learner, I want to request hints when I am stuck, so that I can continue making progress without frustration.

#### Acceptance Criteria

1. WHEN a learner requests a hint, THE AI_Feedback_Engine SHALL provide a clue indicating the type or category of the next correct Grammar_Block without specifying the exact block or its final position, within 5 seconds of the request
2. THE App SHALL limit hints to a maximum of 2 per Exercise attempt to encourage independent problem-solving
3. WHEN hints are exhausted for an Exercise attempt, THE App SHALL disable the hint button and display a message indicating that no hints remain
4. IF the AI_Feedback_Engine fails to generate a hint, THEN THE App SHALL display a message indicating the hint is temporarily unavailable and SHALL NOT decrement the learner's remaining hint count

### Requirement 8: Leaderboard [Optional/Stretch]

**User Story:** As a language learner, I want to see how I compare to other learners, so that I feel motivated through friendly competition.

#### Acceptance Criteria

1. THE App SHALL display a leaderboard ranking learners by total Exercises completed in descending order, with ties broken by earliest completion timestamp
2. WHEN a learner completes an Exercise, THE Progress_Tracker SHALL increment that learner's leaderboard score by 1
3. THE App SHALL display up to 10 learners on the leaderboard page, showing each learner's display name, rank position, and total Exercises completed
4. THE App SHALL display the current learner's own rank position and score on the leaderboard page, even if the learner is not in the top 10

### Requirement 9: Audio Pronunciation [Optional/Stretch]

**User Story:** As a language learner, I want to hear the pronunciation of my constructed sentence, so that I can practice listening alongside reading.

#### Acceptance Criteria

1. WHEN a learner submits a correct sentence, THE App SHALL display a play-audio control that allows the learner to hear the pronunciation of the submitted sentence in the target language
2. WHEN the learner activates the play-audio control, THE App SHALL generate and play pronunciation audio of the sentence using a text-to-speech service within 5 seconds of activation
3. IF the text-to-speech service is unavailable or audio generation fails, THEN THE App SHALL display a message indicating that audio is temporarily unavailable without blocking other app functionality
