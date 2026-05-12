-- tb_forum 贴吧论坛表

CREATE TABLE IF NOT EXISTS tb_bar (
                                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                                      name TEXT NOT NULL UNIQUE,
                                      description TEXT DEFAULT '',
                                      avatar TEXT DEFAULT '',
                                      member_count INTEGER DEFAULT 0,
                                      post_count INTEGER DEFAULT 0,
                                      create_time TEXT DEFAULT (datetime('now'))
    );

CREATE TABLE IF NOT EXISTS tb_post (
                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                       title TEXT NOT NULL,
                                       content TEXT NOT NULL,
                                       user_id INTEGER NOT NULL,
                                       bar_id INTEGER NOT NULL,
                                       media_type TEXT DEFAULT NULL,
                                       media_url TEXT DEFAULT NULL,
                                       media_width INTEGER DEFAULT NULL,
                                       media_height INTEGER DEFAULT NULL,
                                       view_count INTEGER DEFAULT 0,
                                       like_count INTEGER DEFAULT 0,
                                       dislike_count INTEGER DEFAULT 0,
                                       question_count INTEGER DEFAULT 0,
                                       comment_count INTEGER DEFAULT 0,
                                       is_pinned INTEGER DEFAULT 0,
                                       create_time TEXT DEFAULT (datetime('now')),
    update_time TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (bar_id) REFERENCES tb_bar(id)
    );

CREATE TABLE IF NOT EXISTS tb_comment (
                                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                                          content TEXT NOT NULL,
                                          user_id INTEGER NOT NULL,
                                          post_id INTEGER NOT NULL,
                                          parent_id INTEGER DEFAULT NULL,
                                          reply_to INTEGER DEFAULT NULL,
                                          like_count INTEGER DEFAULT 0,
                                          dislike_count INTEGER DEFAULT 0,
                                          question_count INTEGER DEFAULT 0,
                                          create_time TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (post_id) REFERENCES tb_post(id)
    );

CREATE TABLE IF NOT EXISTS tb_reaction (
                                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                                           user_id INTEGER NOT NULL,
                                           target_type TEXT NOT NULL,
                                           target_id INTEGER NOT NULL,
                                           reaction_type TEXT NOT NULL,
                                           create_time TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, target_type, target_id)
    );

CREATE TABLE IF NOT EXISTS tb_user_bar (
                                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                                           user_id INTEGER NOT NULL,
                                           bar_id INTEGER NOT NULL,
                                           create_time TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, bar_id)
    );