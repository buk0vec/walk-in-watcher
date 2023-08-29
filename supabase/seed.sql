-- cases seed data
INSERT INTO cases (username, name, phone_number, summary, ticket_needed, ticket_link, created_at, closed_at)
VALUES
    ('user1', 'John Doe', '1234567890', 'Internet connection issue', true, 'https://example.com/ticket/1', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
    ('user2', 'Jane Smith', '9876543210', 'Software installation problem', true, 'https://example.com/ticket/2', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
    ('user3', 'Alice Johnson', NULL, 'Printer not working', true, 'https://example.com/ticket/3', NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day'),
    ('user4', 'Bob Williams', '1112223333', 'Email not syncing', true, 'https://example.com/ticket/4', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),
    ('user5', 'Emily Brown', NULL, 'Slow computer performance', true, 'https://example.com/ticket/5', NOW() - INTERVAL '6 days', NULL),
    ('user6', 'Michael Davis', '4445556666', 'Operating system crash', true, NULL, NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),
    ('user7', 'Olivia Wilson', '7778889999', 'Peripheral device not recognized', false, NULL, NOW() - INTERVAL '8 days', NULL),
    ('user8', NULL, '2223334444', 'Software freezing issue', true, 'https://example.com/ticket/8', NOW() - INTERVAL '9 days', NOW() - INTERVAL '7 days'),
    ('user9', 'Sophia Taylor', NULL, 'Data recovery needed', false, NULL, NOW() - INTERVAL '10 days', NULL),
    ('user10', 'Liam Anderson', '9990001111', 'Network configuration problem', true, NULL, NOW() - INTERVAL '11 days', NOW() - INTERVAL '9 days');
