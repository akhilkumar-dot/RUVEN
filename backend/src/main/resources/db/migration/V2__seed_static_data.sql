-- V2__seed_static_data.sql
-- Production seed: plans, themes, palettes, document templates, feature flags, house ads

-- ===== PLANS =====
INSERT INTO plans (id, name, slug, price_paise, interval, features) VALUES
(uuid_generate_v4(), 'Free', 'free', 0, 'MONTH', '{"connections_per_day":5,"intros_per_month":3,"sponsored_ads":true,"layouts":false,"palettes":false}'),
(uuid_generate_v4(), 'Pro',  'pro',  19900, 'MONTH', '{"connections_per_day":15,"intros_per_month":15,"sponsored_ads":false,"layouts":true,"palettes":true}');

-- ===== FEATURE FLAGS =====
INSERT INTO feature_flags (key, enabled, description) VALUES
('oauth.twitter', false, 'Enable Twitter/X OAuth login'),
('oauth.github', false, 'Enable GitHub OAuth login'),
('web_push', false, 'Enable web push notifications (VAPID)'),
('realtime_codoc', false, 'Enable real-time co-document editing (Yjs)'),
('captcha_on_login', false, 'Enable Turnstile CAPTCHA after N failed login attempts'),
('analytics', false, 'Enable PostHog/Plausible analytics');

-- ===== THEMES (Company pages - 9 layouts) =====
INSERT INTO themes (id, kind, name, is_free, config) VALUES
('classic', 'COMPANY', 'Classic Midnight', true, '{"hero":"std","bg":"#000","bg2":"#0c0c11","cd":"#16161c","fg":"#fff","mu2":"#b9bfd6","bd":"#ffffff22","lt":"#fff","ltx":"#000","ac":"#3b82f6","ac2":"#7dd3fc","ac3":"#0a1f5c","hg1":"#02040c","hg2":"#0a1f5c"}'),
('poseify', 'COMPANY', 'Pink Noir', false, '{"hero":"center","bg":"#0b0b0b","bg2":"#141414","cd":"#1a1a1a","fg":"#fff","mu2":"#b9bfd6","bd":"#ffffff22","lt":"#fff","ltx":"#0b0b0b","ac":"#e91e8c","ac2":"#ff7ab8","ac3":"#4a0f2f","hg1":"#000","hg2":"#4a0f2f","ff":"Work Sans,system-ui","fh":"Jost,Work Sans","tt":"uppercase","ls":"1px","bt":"999px"}'),
('brivon', 'COMPANY', 'Neon Studio', false, '{"hero":"neon","bg":"#0a0a0c","bg2":"#101014","cd":"#17171c","fg":"#fff","mu2":"#b9bfd6","bd":"#ffffff22","lt":"#f4f4ef","ltx":"#0a0a0c","ac":"#d4ff3a","ac2":"#e6ff7a","ac3":"#2c3a00","hg1":"#0a0a0c","hg2":"#2c3a00","fh":"Anton,Impact,sans-serif","tt":"uppercase","ls":"0","bt":"999px"}'),
('lustro', 'COMPANY', 'Aurora Slides', false, '{"hero":"aurora","bg":"#090a1c","bg2":"#0e1030","cd":"#151846","fg":"#fff","mu2":"#b9bfd6","bd":"#ffffff22","lt":"#fff","ltx":"#090a1c","ac":"#b48cff","ac2":"#7dd3fc","ac3":"#2a1a6e","hg1":"#090a1c","hg2":"#3b2a9e","ff":"Space Grotesk,system-ui","fh":"Space Grotesk,system-ui","bt":"999px","ls":"-1px","rd":"18px"}'),
('editorial', 'COMPANY', 'Editorial Cream', false, '{"hero":"side","bg":"#faf6ef","bg2":"#f1eadc","cd":"#ebe2d0","fg":"#1b1b1b","mu2":"#5c5648","bd":"#1b1b1b22","lt":"#1b1b1b","ltx":"#faf6ef","ac":"#c2410c","ac2":"#ea580c","ac3":"#fde4d0","hg1":"#1b1b1b","hg2":"#7c2d12","fh":"Playfair Display,Georgia,serif","ff":"Georgia,serif","bt":"4px","rd":"6px"}'),
('split', 'COMPANY', 'Emerald Split', false, '{"hero":"side","bg":"#04110c","bg2":"#082017","cd":"#0d2e22","fg":"#fff","mu2":"#b9bfd6","bd":"#ffffff22","lt":"#fff","ltx":"#04110c","ac":"#34d399","ac2":"#6ee7b7","ac3":"#064e3b","hg1":"#04110c","hg2":"#047857","bt":"999px","rd":"26px"}'),
('sunrise', 'COMPANY', 'Sunrise Agency', false, '{"hero":"side","bg":"#1a0f0a","bg2":"#241510","cd":"#2f1c14","fg":"#fff","mu2":"#b9bfd6","bd":"#ffffff22","lt":"#fff","ltx":"#1a0f0a","ac":"#ff7a45","ac2":"#ffb08a","ac3":"#5a2410","hg1":"#1a0f0a","hg2":"#8a3a14","bt":"10px","rd":"20px"}'),
('oceantech', 'COMPANY', 'Ocean Tech', false, '{"hero":"aurora","bg":"#041218","bg2":"#071d26","cd":"#0c2b38","fg":"#fff","mu2":"#b9bfd6","bd":"#ffffff22","lt":"#fff","ltx":"#041218","ac":"#22d3ee","ac2":"#67e8f9","ac3":"#0c4a5c","hg1":"#041218","hg2":"#0e7490","ff":"Space Grotesk,system-ui","fh":"Space Grotesk,system-ui","bt":"999px","rd":"18px"}'),
('paperco', 'COMPANY', 'Clean Paper', false, '{"hero":"center","bg":"#f7f8fb","bg2":"#eceff6","cd":"#ffffff","fg":"#101828","mu2":"#546075","bd":"#10182822","lt":"#101828","ltx":"#f7f8fb","ac":"#2563eb","ac2":"#60a5fa","ac3":"#dbeafe","hg1":"#101828","hg2":"#1e40af","bt":"8px","rd":"16px"}');

-- ===== THEMES (Profile pages - 9 layouts) =====
INSERT INTO themes (id, kind, name, is_free, config) VALUES
('noir', 'PROFILE', 'Noir Portrait', true, '{"hero":"std","bg":"#000","bg2":"#0c0c11","cd":"#16161c","fg":"#fff","mu2":"#b9bfd6","bd":"#ffffff22","lt":"#fff","ltx":"#000","ac":"#3b82f6","ac2":"#7dd3fc","ac3":"#0a1f5c","hg1":"#02040c","hg2":"#0a1f5c"}'),
('soft', 'PROFILE', 'Soft Blue', false, '{"hero":"soft","bg":"#cdd6e6","bg2":"#bcc7dc","cd":"#e4eaf5","fg":"#17213a","mu2":"#4a5878","bd":"#17213a22","lt":"#17213a","ltx":"#eef2fa","ac":"#ef476f","ac2":"#ff7a9a","ac3":"#f9c6d3","hg1":"#17213a","hg2":"#3b4a78","ff":"Poppins,system-ui","fh":"Poppins,system-ui","bt":"4px","rd":"14px"}'),
('mono', 'PROFILE', 'Mono Bridge', false, '{"hero":"mono","bg":"#6d6d6d","bg2":"#5e5e5e","cd":"#4f4f4f","fg":"#fff","mu2":"#e4e4e4","bd":"#ffffff33","lt":"#fff","ltx":"#262626","ac":"#ffffff","ac2":"#e5e5e5","ac3":"#3a3a3a","hg1":"#2a2a2a","hg2":"#6d6d6d","ff":"Open Sans,system-ui","fh":"Open Sans,system-ui","tt":"uppercase","ls":"2px","bt":"999px"}'),
('lavender', 'PROFILE', 'Lavender Profile', false, '{"hero":"lav","bg":"#e8ebf8","bg2":"#dde1f3","cd":"#ffffff","fg":"#1f2440","mu2":"#5a6285","bd":"#1f244022","lt":"#1f2440","ltx":"#f3f4fc","ac":"#e11d74","ac2":"#f472b6","ac3":"#fbcfe8","hg1":"#1f2440","hg2":"#4338ca","ff":"Poppins,system-ui","fh":"Syne,Poppins,system-ui","bt":"10px","rd":"16px","cards":true}'),
('gold', 'PROFILE', 'Executive Gold', false, '{"hero":"gold","bg":"#070604","bg2":"#100d07","cd":"#1a150a","fg":"#fff","mu2":"#b9bfd6","bd":"#ffffff22","lt":"#fff8e1","ltx":"#1a1400","ac":"#d4a017","ac2":"#fde68a","ac3":"#3b2f0b","hg1":"#070604","hg2":"#6b4e0a","fh":"Playfair Display,Georgia,serif","bt":"999px"}'),
('mint', 'PROFILE', 'Mint Clean', false, '{"hero":"side","bg":"#effaf5","bg2":"#dff3ea","cd":"#ffffff","fg":"#0f2a22","mu2":"#4a6a60","bd":"#0f2a2222","lt":"#0f2a22","ltx":"#effaf5","ac":"#059669","ac2":"#10b981","ac3":"#bbf7d0","hg1":"#0f2a22","hg2":"#047857","ff":"Poppins,system-ui","fh":"Poppins,system-ui","bt":"999px","rd":"20px","cards":true}'),
('rose', 'PROFILE', 'Rose Studio', false, '{"hero":"soft","bg":"#fbe9ee","bg2":"#f6d6df","cd":"#fff5f8","fg":"#3a1220","mu2":"#7a4a5a","bd":"#3a122022","lt":"#3a1220","ltx":"#fff5f8","ac":"#d6336c","ac2":"#f06595","ac3":"#ffd6e3","hg1":"#3a1220","hg2":"#9c2a55","ff":"Poppins,system-ui","fh":"Poppins,system-ui","bt":"999px","rd":"18px"}'),
('inkblue', 'PROFILE', 'Ink Blue', false, '{"hero":"std","bg":"#06101f","bg2":"#0a1a33","cd":"#10244a","fg":"#fff","mu2":"#b9bfd6","bd":"#ffffff22","lt":"#fff","ltx":"#06101f","ac":"#4f9dff","ac2":"#93c5fd","ac3":"#12305f","hg1":"#06101f","hg2":"#1d4ed8","bt":"10px","rd":"16px"}'),
('sunsetpf', 'PROFILE', 'Sunset Glow', false, '{"hero":"lav","bg":"#fff1e6","bg2":"#ffe2cc","cd":"#ffffff","fg":"#3b1d0f","mu2":"#7a5340","bd":"#3b1d0f22","lt":"#3b1d0f","ltx":"#fff1e6","ac":"#f97316","ac2":"#fb923c","ac3":"#fed7aa","hg1":"#3b1d0f","hg2":"#c2410c","bt":"999px","rd":"20px"}');

-- ===== APP PALETTES (10) =====
INSERT INTO app_palettes (id, name, is_free, config) VALUES
('aurora', 'Indigo Night', true, '{"pr":"#818cf8","pk":"#22d3ee","p3":"#3730a3","bg":"#0a0f1f","card":"#121a33","tx":"#f1f5ff","mu":"#a5b4d4","br":"#26335f"}'),
('noirpink', 'Noir Rose', false, '{"pr":"#f43f8e","pk":"#fb9ac4","p3":"#9d174d","bg":"#0c0a0b","card":"#17131a","tx":"#fff7fb","mu":"#b4a3ad","br":"#2e2229"}'),
('neonlime', 'Lime Graphite', false, '{"pr":"#a3e635","pk":"#facc15","p3":"#4d7c0f","bg":"#0b0d09","card":"#14180f","tx":"#f7fbea","mu":"#aab396","br":"#262d1b"}'),
('ocean', 'Deep Ocean', false, '{"pr":"#22d3ee","pk":"#38bdf8","p3":"#0e7490","bg":"#041218","card":"#0c2b38","tx":"#ecfeff","mu":"#94e6ff","br":"#0c4a5c"}'),
('crimson', 'Crimson Fire', false, '{"pr":"#ef4444","pk":"#f97316","p3":"#991b1b","bg":"#0f0808","card":"#1c1010","tx":"#fff1f2","mu":"#fca5a5","br":"#350f0f"}'),
('emerald', 'Emerald Night', false, '{"pr":"#10b981","pk":"#34d399","p3":"#065f46","bg":"#04110c","card":"#0d2e22","tx":"#ecfdf5","mu":"#6ee7b7","br":"#064e3b"}'),
('gold', 'Executive Gold', false, '{"pr":"#d4a017","pk":"#fde68a","p3":"#6b4e0a","bg":"#070604","card":"#1a150a","tx":"#fff8e1","mu":"#fcd34d","br":"#3b2f0b"}'),
('lavender', 'Soft Lavender', false, '{"pr":"#a78bfa","pk":"#c4b5fd","p3":"#4c1d95","bg":"#0d0b14","card":"#1a1528","tx":"#faf5ff","mu":"#c4b5fd","br":"#2e1a47"}'),
('rose', 'Rose Garden', false, '{"pr":"#f43f5e","pk":"#fb7185","p3":"#9f1239","bg":"#0e0508","card":"#1c0d10","tx":"#fff1f5","mu":"#fda4af","br":"#3a0f1a"}'),
('mono', 'Pure Mono', false, '{"pr":"#ffffff","pk":"#d4d4d4","p3":"#525252","bg":"#0a0a0a","card":"#161616","tx":"#fafafa","mu":"#a3a3a3","br":"#262626"}');

-- ===== DOCUMENT TEMPLATES =====
-- These are stored as feature flags / config; the actual templates are in code
-- but we seed the keys here for reference.
INSERT INTO feature_flags (key, enabled, description) VALUES
('doc_template.pitch_outline', true, 'Document template: Pitch outline'),
('doc_template.one_pager', true, 'Document template: One-pager'),
('doc_template.meeting_notes', true, 'Document template: Meeting notes'),
('doc_template.okrs', true, 'Document template: OKRs'),
('doc_template.investor_update', true, 'Document template: Investor update'),
('doc_template.product_roadmap', true, 'Document template: Product roadmap'),
('doc_template.hiring_plan', true, 'Document template: Hiring plan'),
('doc_template.go_to_market', true, 'Document template: Go-to-market plan');
