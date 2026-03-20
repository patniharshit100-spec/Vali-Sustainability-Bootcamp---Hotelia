-- =============================================================================
-- Hotel Insight — Seed Data
-- Run AFTER schema.sql. Safe to re-run (uses TRUNCATE ... CASCADE at top).
-- =============================================================================

-- Wipe existing seed data (keeps schema intact)
TRUNCATE TABLE insights, reviews, tasks, messages, rooms, reservations,
              competitors, staff, booking_sources
CASCADE;

-- =============================================================================
-- STAFF (8 members)
-- =============================================================================

INSERT INTO staff (name, role, is_on_duty, phone) VALUES
  ('Maria Santos',    'manager',       true,  '+351 912 000 001'),
  ('Pierre Lecomte',  'receptionist',  true,  '+33 6 10 00 00 01'),
  ('Ingrid Becker',   'receptionist',  false, '+49 170 000 0001'),
  ('Carlos Vega',     'maintenance',   true,  '+34 610 000 001'),
  ('Fatima Al-Hassan','housekeeper',   true,  '+351 912 000 002'),
  ('Jean-Paul Marin', 'housekeeper',   false, '+33 6 10 00 00 02'),
  ('Tom Walker',      'porter',        true,  '+44 7700 000001'),
  ('Ana Pereira',     'receptionist',  true,  '+351 912 000 003');

-- =============================================================================
-- COMPETITORS (5 hotels)
-- =============================================================================

INSERT INTO competitors
  (hotel_name, standard_price, superieure_price, deluxe_price, suite_price,
   famille_price, wifi, breakfast_price, parking_price, pool, spa_price, rating)
VALUES
  ('Hôtel Bellevue',     85,  105, 140, 195, 165, true, 18, 20, false, null,   8.1),
  ('Grand Mercure',      90,  115, 150, 210, 175, true, 22, 25, true,  35,     8.4),
  ('Ibis Styles Centre', 70,   85, 110, 160, 140, true, 12, 15, false, null,   7.8),
  ('Novotel Harbour',    95,  120, 155, 220, 185, true, 20, 22, true,  40,     8.6),
  ('Hôtel du Commerce',  75,   95, 125, 180, 150, true, 15, 18, false, null,   7.5);

-- =============================================================================
-- ROOMS (30 rooms across 3 floors)
-- =============================================================================

INSERT INTO rooms (number, floor, type, status, max_occupancy, base_price, amenities) VALUES
-- Floor 1 — Standard x8, Familiale x2
('101','1','Standard',    'occupied',    2, 85,  ARRAY['WiFi','TV','Safe','Hairdryer']),
('102','1','Standard',    'occupied',    2, 85,  ARRAY['WiFi','TV','Safe','Hairdryer']),
('103','1','Standard',    'available',   2, 85,  ARRAY['WiFi','TV','Safe','Hairdryer']),
('104','1','Standard',    'occupied',    2, 85,  ARRAY['WiFi','TV','Safe','Hairdryer']),
('105','1','Standard',    'maintenance', 2, 85,  ARRAY['WiFi','TV','Safe','Hairdryer']),
('106','1','Standard',    'occupied',    2, 85,  ARRAY['WiFi','TV','Safe','Hairdryer']),
('107','1','Standard',    'cleaning',    2, 85,  ARRAY['WiFi','TV','Safe','Hairdryer']),
('108','1','Standard',    'available',   2, 85,  ARRAY['WiFi','TV','Safe','Hairdryer']),
('109','1','Familiale',   'occupied',    4, 155, ARRAY['WiFi','TV','Safe','Hairdryer','Crib','Extra Bed']),
('110','1','Familiale',   'available',   4, 155, ARRAY['WiFi','TV','Safe','Hairdryer','Crib','Extra Bed']),
-- Floor 2 — Standard x4, Supérieure x5, Deluxe x1
('201','2','Standard',    'occupied',    2, 85,  ARRAY['WiFi','TV','Safe','Hairdryer']),
('202','2','Standard',    'available',   2, 85,  ARRAY['WiFi','TV','Safe','Hairdryer']),
('203','2','Standard',    'occupied',    2, 85,  ARRAY['WiFi','TV','Safe','Hairdryer']),
('204','2','Standard',    'occupied',    2, 85,  ARRAY['WiFi','TV','Safe','Hairdryer']),
('205','2','Supérieure',  'occupied',    2, 110, ARRAY['WiFi','TV','Safe','Hairdryer','Minibar','City View']),
('206','2','Supérieure',  'available',   2, 110, ARRAY['WiFi','TV','Safe','Hairdryer','Minibar','City View']),
('207','2','Supérieure',  'occupied',    2, 110, ARRAY['WiFi','TV','Safe','Hairdryer','Minibar','City View']),
('208','2','Supérieure',  'occupied',    3, 110, ARRAY['WiFi','TV','Safe','Hairdryer','Minibar','City View']),
('209','2','Supérieure',  'occupied',    2, 110, ARRAY['WiFi','TV','Safe','Hairdryer','Minibar','City View']),
('210','2','Deluxe',      'occupied',    2, 145, ARRAY['WiFi','TV','Safe','Hairdryer','Minibar','Bathtub','Sea View']),
-- Floor 3 — Supérieure x3, Deluxe x4, Suite x3
('301','3','Supérieure',  'available',   2, 115, ARRAY['WiFi','TV','Safe','Hairdryer','Minibar','Terrace']),
('302','3','Supérieure',  'occupied',    2, 115, ARRAY['WiFi','TV','Safe','Hairdryer','Minibar','Terrace']),
('303','3','Supérieure',  'occupied',    2, 115, ARRAY['WiFi','TV','Safe','Hairdryer','Minibar','Terrace']),
('304','3','Deluxe',      'occupied',    2, 150, ARRAY['WiFi','TV','Safe','Hairdryer','Minibar','Bathtub','Terrace']),
('305','3','Deluxe',      'available',   2, 150, ARRAY['WiFi','TV','Safe','Hairdryer','Minibar','Bathtub','Terrace']),
('306','3','Deluxe',      'occupied',    3, 150, ARRAY['WiFi','TV','Safe','Hairdryer','Minibar','Bathtub','Terrace']),
('307','3','Deluxe',      'occupied',    2, 150, ARRAY['WiFi','TV','Safe','Hairdryer','Minibar','Bathtub','Terrace']),
('308','3','Suite',       'occupied',    2, 200, ARRAY['WiFi','TV','Safe','Hairdryer','Minibar','Jacuzzi','Sea View','Living Room']),
('309','3','Suite',       'available',   2, 200, ARRAY['WiFi','TV','Safe','Hairdryer','Minibar','Jacuzzi','Sea View','Living Room']),
('310','3','Suite',       'occupied',    4, 210, ARRAY['WiFi','TV','Safe','Hairdryer','Minibar','Jacuzzi','Sea View','Living Room','Kitchen']);

-- =============================================================================
-- RESERVATIONS (200 rows via PL/pgSQL — realistic European data)
-- =============================================================================

DO $$
DECLARE
  first_names TEXT[] := ARRAY[
    'Marie','Jean','Pierre','Sophie','Thomas','Emma','Nicolas','Isabelle','François','Céline',
    'Hans','Greta','Klaus','Ingrid','Friedrich','Heike','Dieter','Sabine','Wolfgang','Monika',
    'Carlos','María','José','Carmen','Antonio','Isabel','Manuel','Lucía','Rafael','Pilar',
    'João','Ana','Miguel','Filipa','Ricardo','Marta','Rui','Catarina','Nuno','Sofia',
    'James','Emma','Oliver','Charlotte','William','Olivia','George','Amelia','Harry','Isla',
    'Luca','Giulia','Marco','Valentina','Alessandro','Chiara','Lorenzo','Martina','Davide','Sara'
  ];
  last_names TEXT[] := ARRAY[
    'Martin','Dupont','Bernard','Moreau','Lefebvre','Simon','Michel','Laurent','Garcia','David',
    'Müller','Schmidt','Koch','Becker','Wagner','Fischer','Weber','Schulz','Meyer','Hoffmann',
    'García','Rodríguez','Martínez','López','Sánchez','Pérez','González','Fernández','Díaz','Torres',
    'Silva','Santos','Ferreira','Costa','Oliveira','Pereira','Rodrigues','Alves','Martins','Carvalho',
    'Smith','Jones','Williams','Brown','Taylor','Davies','Evans','Thomas','Johnson','White',
    'Rossi','Ferrari','Esposito','Bianchi','Romano','Ricci','Marino','Greco','Bruno','Gallo'
  ];
  channels     TEXT[] := ARRAY['Booking.com','Booking.com','Booking.com','Booking.com','Booking.com',
                                'Booking.com','Direct','Direct','Direct','Direct',
                                'Expedia','WhatsApp','Email','Phone'];
  room_types   TEXT[] := ARRAY['Standard','Standard','Standard','Standard','Supérieure','Supérieure',
                                'Deluxe','Suite','Familiale'];
  meal_plans   TEXT[] := ARRAY['BB','BB','BB','HB','SC','FB'];
  countries    TEXT[] := ARRAY['FRA','FRA','GBR','DEU','DEU','ESP','PRT','ITA'];
  room_numbers TEXT[] := ARRAY['101','102','104','106','201','203','204','205','207','208','209',
                                '210','302','303','304','306','307','308','310'];
  special_reqs TEXT[][] := ARRAY[
    ARRAY['Late check-out'],
    ARRAY['Non-smoking room','High floor'],
    ARRAY['Extra towels','Baby cot'],
    ARRAY['Quiet room'],
    ARRAY['Early check-in','Sea view'],
    NULL
  ];
  i       INTEGER;
  fname   TEXT;
  lname   TEXT;
  gname   TEXT;
  cin     DATE;
  cout    DATE;
  rt      TEXT;
  ch      TEXT;
  st      TEXT;
  price   NUMERIC;
  nights  INTEGER;
  ctry    TEXT;
  rnum    TEXT;
  sreqs   TEXT[];
BEGIN
  FOR i IN 1..200 LOOP
    fname  := first_names [1 + (floor(random() * array_length(first_names,  1)))::int];
    lname  := last_names  [1 + (floor(random() * array_length(last_names,   1)))::int];
    gname  := fname || ' ' || lname;
    ctry   := countries   [1 + (floor(random() * array_length(countries,    1)))::int];
    ch     := channels    [1 + (floor(random() * array_length(channels,     1)))::int];
    rt     := room_types  [1 + (floor(random() * array_length(room_types,   1)))::int];
    rnum   := room_numbers[1 + (floor(random() * array_length(room_numbers, 1)))::int];

    -- Spread check-ins across -5 to +30 days from today
    cin    := CURRENT_DATE + (floor(random() * 36) - 5)::int;
    nights := 1 + floor(random() * 6)::int;
    cout   := cin + nights;

    -- Status: ~78% active (confirmed / checked-in / checked-out)
    IF random() < 0.78 THEN
      IF cin <= CURRENT_DATE AND cout > CURRENT_DATE THEN
        st := 'checked-in';
      ELSIF cout <= CURRENT_DATE THEN
        st := 'checked-out';
      ELSE
        st := 'confirmed';
      END IF;
    ELSE
      st := CASE WHEN random() < 0.6 THEN 'cancelled' ELSE 'no-show' END;
    END IF;

    -- ADR by room type
    price := nights * (
      CASE rt
        WHEN 'Standard'   THEN 80  + floor(random() * 30)
        WHEN 'Supérieure' THEN 105 + floor(random() * 35)
        WHEN 'Deluxe'     THEN 135 + floor(random() * 40)
        WHEN 'Suite'      THEN 185 + floor(random() * 40)
        WHEN 'Familiale'  THEN 150 + floor(random() * 30)
        ELSE 90
      END
    );

    sreqs := special_reqs[1 + (floor(random() * 6))::int];

    INSERT INTO reservations (
      guest_name, guest_email, guest_country,
      check_in, check_out, room_type, room_number, status, channel,
      total_price, amount_paid, number_of_guests, meal_plan,
      special_requests, is_repeated_guest, created_at
    ) VALUES (
      gname,
      lower(regexp_replace(fname, '[^a-zA-Z]', '', 'g'))
        || '.' || lower(regexp_replace(lname, '[^a-zA-Z]', '', 'g'))
        || '@example.com',
      ctry,
      cin, cout, rt, rnum, st, ch,
      price, round(price * 0.5, 2),
      1 + floor(random() * 3)::int,
      meal_plans[1 + (floor(random() * array_length(meal_plans, 1)))::int],
      sreqs,
      random() < 0.2,
      now() - (floor(random() * 60) * interval '1 day')
    );
  END LOOP;
END;
$$;

-- =============================================================================
-- MESSAGES (40 — multilingual, realistic hotel scenarios)
-- =============================================================================

INSERT INTO messages
  (guest_name, channel, direction, subject, message_text, language,
   category, urgency, status, ai_suggested_reply, conversation_id)
VALUES

-- ── French (6): cancellations & refund requests ─────────────────────────────
('Claire Moreau', 'Email', 'inbound',
 'Demande d''annulation — réservation du 15 mai',
 'Bonjour, je me permets de vous contacter suite à un imprévu familial qui m''oblige à annuler ma réservation prévue du 15 au 18 mai. Je souhaiterais obtenir un remboursement complet si possible. Merci de bien vouloir traiter ma demande dans les plus brefs délais.',
 'fr', 'cancellation', 'high', 'ai-reply-ready',
 'Chère Madame Moreau, nous avons bien reçu votre demande d''annulation. Compte tenu des circonstances, nous vous confirmons l''annulation de votre réservation du 15 au 18 mai et le remboursement intégral de la somme payée sous 5 à 7 jours ouvrés. Nous vous souhaitons tout notre soutien dans cette période difficile et espérons vous accueillir prochainement. Cordialement, L''équipe de l''hôtel.',
 'conv-fr-001'),

('Jean-Paul Renard', 'Booking.com', 'inbound',
 'Remboursement — séjour annulé',
 'Bonsoir, j''ai annulé ma réservation il y a 3 jours mais je n''ai toujours pas reçu mon remboursement. Pouvez-vous vérifier ? Numéro de réservation : BK-20240312. Merci.',
 'fr', 'refund', 'medium', 'ai-reply-ready',
 'Cher Monsieur Renard, nous sommes désolés pour ce désagrément. Votre demande de remboursement pour la réservation BK-20240312 a bien été enregistrée et sera traitée sous 3 à 5 jours ouvrés. Les délais peuvent varier selon votre banque. N''hésitez pas à nous recontacter si vous n''avez toujours rien reçu passé ce délai. Bien cordialement.',
 'conv-fr-002'),

('Sophie Dubois', 'WhatsApp', 'inbound',
 'Modification de dates',
 'Bonjour ! Je voudrais modifier mes dates d''arrivée, je viens le 22 au lieu du 20. Est-ce possible sans frais supplémentaires ? Merci 😊',
 'fr', 'modification', 'low', 'ai-reply-ready',
 'Bonjour Sophie ! Bien sûr, nous pouvons modifier votre arrivée au 22 sans frais additionnels, sous réserve de disponibilité. Je vérifie cela pour vous et vous confirme rapidement. À bientôt !',
 'conv-fr-003'),

('François Léger', 'Email', 'inbound',
 'Annulation cause médicale',
 'Madame, Monsieur, Suite à une hospitalisation imprévue, je suis dans l''impossibilité d''honorer ma réservation du 10 au 14 juin. Je vous transmets le certificat médical en pièce jointe et sollicite un remboursement exceptionnel. Dans l''attente de votre réponse, veuillez agréer mes salutations distinguées.',
 'fr', 'cancellation', 'high', 'ai-reply-ready',
 'Cher Monsieur Léger, nous prenons acte de votre situation et vous adressons nos vœux de prompt rétablissement. À réception de votre certificat médical, nous procéderons à l''annulation de votre réservation et au remboursement intégral, conformément à notre politique dérogatoire pour motif médical. Veuillez agréer nos sincères salutations.',
 'conv-fr-004'),

('Isabelle Bonnet', 'Booking.com', 'inbound',
 'Pas reçu confirmation',
 'Bonjour, j''ai réservé une chambre double pour le 5 juillet mais je n''ai pas reçu de confirmation par e-mail. Pouvez-vous me la renvoyer ? Merci.',
 'fr', 'information', 'low', 'ai-reply-ready',
 'Bonjour Isabelle, votre réservation pour le 5 juillet est bien confirmée dans notre système. Nous vous renvoyons la confirmation à votre adresse e-mail immédiatement. Pensez à vérifier vos spams si vous ne la recevez pas d''ici quelques minutes. Bonne journée !',
 'conv-fr-005'),

('Nicolas Petit', 'Email', 'inbound',
 'Remboursement suite erreur de facturation',
 'Bonjour, en consultant mon relevé bancaire, j''ai constaté que vous m''avez prélevé deux fois pour la même réservation. Pourriez-vous vérifier et procéder au remboursement du doublon ? Merci d''avance.',
 'fr', 'refund', 'high', 'ai-reply-ready',
 'Cher Monsieur Petit, nous nous excusons sincèrement pour cette erreur de facturation. Après vérification, nous confirmons le double prélèvement et procéderons au remboursement immédiat de la somme indûment débitée. Vous recevrez un justificatif par e-mail. Encore toutes nos excuses.',
 'conv-fr-006'),

-- ── English (8): pre-arrival questions ──────────────────────────────────────
('James Wilson', 'Email', 'inbound',
 'Parking availability for our stay',
 'Hello, I have a reservation from June 10–12 and would like to know if you have on-site parking available. If so, what is the cost and do I need to book in advance? Thank you.',
 'en', 'information', 'low', 'ai-reply-ready',
 'Dear James, great news — we do have on-site parking available at €15 per night. Spaces are limited so we recommend reserving in advance by replying to this message with your vehicle registration. We look forward to welcoming you on June 10th! Best regards.',
 'conv-en-001'),

('Charlotte Evans', 'WhatsApp', 'inbound',
 'Airport shuttle — late arrival',
 'Hi! We arrive at 11:30pm on Friday. Do you offer an airport shuttle? How much does it cost and how far in advance do we need to book?',
 'en', 'information', 'medium', 'ai-reply-ready',
 'Hi Charlotte! We offer airport transfers 24/7 at €35 per vehicle (up to 4 passengers). For late arrivals like yours, please book at least 4 hours in advance. Just send us your flight number and we''ll arrange everything. See you Friday! 🙂',
 'conv-en-002'),

('Oliver Brown', 'Email', 'inbound',
 'Breakfast included in our package?',
 'Good morning, I booked a Superior room for 3 nights (July 14–17) and I am not sure if breakfast is included. Could you clarify? Also, do you have gluten-free options available?',
 'en', 'information', 'low', 'ai-reply-ready',
 'Good morning Oliver! Your Superior room package includes our daily continental breakfast served from 7:00–10:30am. We do offer gluten-free options — please inform our breakfast team on arrival and they will ensure your needs are met. Enjoy your stay with us!',
 'conv-en-003'),

('Amelia Davies', 'Booking.com', 'inbound',
 'Early check-in request',
 'Hello, our flight arrives very early and we''d like to check in around 9am if possible. Is this something you can accommodate? We have two adults and one child.',
 'en', 'modification', 'medium', 'ai-reply-ready',
 'Dear Amelia, we''d be happy to try to accommodate an early check-in at 9am subject to room availability on the day. We cannot guarantee it, but our team will do their best. In the meantime, you''re welcome to store your luggage and enjoy our bar and common areas upon arrival. We look forward to welcoming your family!',
 'conv-en-004'),

('William Taylor', 'Email', 'inbound',
 'Pool and spa hours',
 'Hi there, I''m staying with you next week and wanted to check the opening hours for the pool and spa, and whether I need to book treatments in advance. Thanks!',
 'en', 'information', 'low', 'ai-reply-ready',
 'Hi William! Our pool is open daily 7am–10pm and the spa is open 9am–8pm. Treatments must be booked in advance — you can do so at the reception desk on arrival or email us your preferences beforehand. We look forward to your visit next week!',
 'conv-en-005'),

('Olivia Johnson', 'WhatsApp', 'inbound',
 'Room accessibility needs',
 'Hello, my mother has limited mobility and uses a walking frame. Do you have an accessible room on the ground floor? Also is there a step-free entrance?',
 'en', 'information', 'high', 'ai-reply-ready',
 'Hello Olivia, absolutely — we have ground-floor accessible rooms with wide doorways, grab rails, and a roll-in shower. Our entrance is fully step-free with automatic doors. I''ll flag your booking for an accessible room assignment. Please let us know if you need anything else for your mother''s comfort.',
 'conv-en-006'),

('Harry White', 'Email', 'inbound',
 'Cot for infant',
 'Good afternoon, we are travelling with a 10-month-old baby and would need a travel cot in the room. Is this available and is there an additional charge?',
 'en', 'information', 'low', 'ai-reply-ready',
 'Good afternoon Harry! We are delighted to welcome your little one. Travel cots are available free of charge — please just confirm your arrival date and room number when you check in and our housekeeping team will set it up for you. See you soon!',
 'conv-en-007'),

('Isla Campbell', 'Booking.com', 'inbound',
 'Pet-friendly policy',
 'Hi, I was hoping to bring my small dog (5kg spaniel). Are pets allowed and is there a surcharge? Also, which floors are pet-friendly rooms on?',
 'en', 'information', 'low', 'ai-reply-ready',
 'Hi Isla! Great news — we are pet-friendly. We welcome dogs up to 10kg with a €20 cleaning surcharge per stay. Pet-friendly rooms are on the first floor. Please let us know in advance so we can prepare your room accordingly. We look forward to welcoming you and your spaniel!',
 'conv-en-008'),

-- ── German (5): complaints ───────────────────────────────────────────────────
('Klaus Müller', 'Email', 'inbound',
 'Lärm in der Nacht — Zimmer 203',
 'Sehr geehrte Damen und Herren, ich möchte mich über erheblichen Lärm beschweren, der gestern Nacht ab ca. 23 Uhr aus dem Zimmer über mir zu hören war. Ich habe mehrfach versucht, die Rezeption zu erreichen, ohne Erfolg. Ich erwarte eine Lösung für die verbleibenden Nächte meines Aufenthalts.',
 'de', 'complaint', 'high', 'ai-reply-ready',
 'Sehr geehrter Herr Müller, wir entschuldigen uns aufrichtig für den Lärm und die Unannehmlichkeiten, die Sie erfahren mussten. Wir haben das Anliegen sofort an unser Nachtteam weitergeleitet und werden sicherstellen, dass dies nicht wieder vorkommt. Für die verbleibenden Nächte bieten wir Ihnen auf Wunsch ein ruhigeres Zimmer an. Bitte wenden Sie sich jederzeit an die Rezeption. Hochachtungsvoll.',
 'conv-de-001'),

('Sabine Fischer', 'Booking.com', 'inbound',
 'Klimaanlage funktioniert nicht',
 'Guten Tag, die Klimaanlage in meinem Zimmer (Zimmer 105) funktioniert seit gestern nicht mehr. Es ist sehr warm draußen und ich habe schlecht geschlafen. Bitte schicken Sie so schnell wie möglich jemanden vorbei.',
 'de', 'maintenance', 'high', 'ai-reply-ready',
 'Guten Tag Frau Fischer, es tut uns sehr leid für die Unannehmlichkeiten. Unser Wartungsteam wird sich umgehend um die Klimaanlage in Zimmer 105 kümmern. Bis zur Reparatur stellen wir Ihnen einen Ventilator zur Verfügung. Wir danken Ihnen für Ihre Geduld.',
 'conv-de-002'),

('Friedrich Wagner', 'WhatsApp', 'inbound',
 'Zimmer nicht sauber bei Ankunft',
 'Hallo, ich bin heute Mittag eingecheckt und das Zimmer war nicht richtig gereinigt — Haare im Bad und ungemachtes Bett. Das ist inakzeptabel für diesen Preis.',
 'de', 'complaint', 'high', 'ai-reply-ready',
 'Guten Tag Herr Wagner, wir entschuldigen uns aufrichtig für diesen Zustand. Das ist unter unserem Standard und wir schämen uns dafür. Das Housekeeping-Team wird Ihr Zimmer sofort gründlich reinigen. Als Entschädigung möchten wir Ihnen einen Drink an der Bar anbieten. Vielen Dank für Ihr Verständnis.',
 'conv-de-003'),

('Greta Hoffmann', 'Email', 'inbound',
 'Heißes Wasser funktioniert nicht',
 'Sehr geehrte Damen und Herren, ich möchte Ihnen mitteilen, dass in meinem Zimmer 302 seit heute Morgen kein heißes Wasser mehr aus der Dusche kommt. Ich bitte um schnellstmögliche Behebung des Problems.',
 'de', 'maintenance', 'urgent', 'ai-reply-ready',
 'Sehr geehrte Frau Hoffmann, wir bedauern dieses Problem sehr. Unser Wartungstechniker wird sich innerhalb der nächsten 30 Minuten um das Heißwasserproblem in Zimmer 302 kümmern. Falls nötig, können wir Ihnen auch ein anderes Zimmer anbieten. Bitte entschuldigen Sie die Unannehmlichkeiten.',
 'conv-de-004'),

('Monika Schulz', 'Email', 'inbound',
 'WLAN Verbindung sehr langsam',
 'Hallo, ich arbeite von diesem Hotel aus und das WLAN ist extrem langsam — kaum 2 Mbit/s. Für Videokonferenzen ist das nicht geeignet. Gibt es eine Alternative oder können Sie das Problem beheben?',
 'de', 'complaint', 'medium', 'ai-reply-ready',
 'Guten Tag Frau Schulz, wir verstehen, wie wichtig eine stabile Internetverbindung für Ihre Arbeit ist. Wir haben eine Verstärkung des WLAN-Signals auf Ihrer Etage veranlasst. Außerdem können wir Ihnen Zugang zu unserem Business-Center anbieten, das über eine dedizierte Glasfaserleitung verfügt. Bitte sprechen Sie uns an der Rezeption an.',
 'conv-de-005'),

-- ── Spanish (4): booking inquiries ──────────────────────────────────────────
('María García', 'Email', 'inbound',
 'Consulta disponibilidad agosto',
 'Buenos días, me gustaría saber si tienen disponibilidad para 2 habitaciones dobles del 14 al 21 de agosto para una familia de 4 adultos. También quería preguntar si ofrecen algún paquete especial para estancias largas. Gracias.',
 'es', 'reservation', 'medium', 'ai-reply-ready',
 'Buenos días María, tenemos disponibilidad para 2 habitaciones Superieure del 14 al 21 de agosto. Para estancias de 7 noches o más ofrecemos un descuento del 10%. El precio total sería de €1.540 para ambas habitaciones con desayuno incluido. ¿Le gustaría que procedamos con la reserva? Un saludo.',
 'conv-es-001'),

('Carlos Rodríguez', 'WhatsApp', 'inbound',
 'Tarifa para luna de miel',
 'Hola buenas! Mi pareja y yo nos casamos el mes que viene y queremos celebrar nuestra luna de miel en su hotel. ¿Tienen alguna suite o paquete especial? ¿Incluye algún detalle de bienvenida?',
 'es', 'reservation', 'medium', 'ai-reply-ready',
 '¡Hola Carlos, muchas felicidades por vuestra boda! 🎉 Sí, tenemos un paquete de luna de miel en nuestra Suite Panorámica que incluye: decoración romántica, champán y fresas de bienvenida, desayuno en habitación y late check-out gratuito. El precio es de €250/noche. ¿Os gustaría reservar?',
 'conv-es-002'),

('Antonio López', 'Email', 'inbound',
 'Grupo de 10 personas — tarifa corporativa',
 'Estimados señores, les escribo en nombre de mi empresa para solicitar una cotización para 5 habitaciones dobles del 18 al 20 de septiembre. Somos una empresa habitual en la zona y nos gustaría negociar una tarifa corporativa. Quedo a su disposición.',
 'es', 'reservation', 'medium', 'ai-reply-ready',
 'Estimado Sr. López, estaremos encantados de alojar a su equipo. Para 5 habitaciones del 18 al 20 de septiembre podemos ofrecerles una tarifa corporativa del 15% sobre nuestra tarifa estándar, lo que supondría €85/noche por habitación. Incluimos sala de reuniones durante 4 horas al día. ¿Le parece bien? Quedamos a su disposición.',
 'conv-es-003'),

('Carmen Martínez', 'Booking.com', 'inbound',
 'Pregunta sobre política de mascotas',
 'Hola! Quería confirmar si admiten mascotas pequeñas. Tenemos un chihuahua de 3 kg. ¿Hay algún suplemento? Gracias.',
 'es', 'information', 'low', 'ai-reply-ready',
 'Hola Carmen! Sí, admitimos mascotas pequeñas hasta 10 kg con un suplemento de €15 por estancia. Su chihuahua es bienvenido. Por favor indíquelo al realizar su check-in para que preparemos la habitación adecuada. ¡Hasta pronto!',
 'conv-es-004'),

-- ── Portuguese (3): modification requests ───────────────────────────────────
('João Silva', 'Email', 'inbound',
 'Alteração de reserva — datas',
 'Boa tarde, tenho uma reserva para os dias 8 a 11 de julho e precisava alterar para 10 a 13 de julho. É possível fazer esta alteração sem custos adicionais? Aguardo a vossa resposta. Com os melhores cumprimentos.',
 'pt', 'modification', 'medium', 'ai-reply-ready',
 'Boa tarde João, verificámos a disponibilidade para 10 a 13 de julho e temos prazer em confirmar a alteração da sua reserva sem qualquer custo adicional. Receberá um email de confirmação em breve. Agradecemos a preferência e desejamos-lhe uma ótima estadia.',
 'conv-pt-001'),

('Ana Pereira', 'WhatsApp', 'inbound',
 'Pedido de quarto extra para criança',
 'Olá! Reservei um quarto duplo mas afinal vamos levar a nossa filha de 8 anos. Seria possível adicionar uma cama extra? Qual é o custo?',
 'pt', 'modification', 'low', 'ai-reply-ready',
 'Olá Ana! Claro que sim, podemos adicionar uma cama extra no seu quarto por €25 por noite. A sua filha é muito bem-vinda! Por favor confirme a alteração e procedemos de imediato. Até breve!',
 'conv-pt-002'),

('Ricardo Ferreira', 'Email', 'inbound',
 'Upgrade disponível?',
 'Bom dia, tenho uma reserva de quarto Standard para o fim de semana de 20 de julho. Gostaria de saber se seria possível fazer um upgrade para um quarto Deluxe e qual seria o custo adicional. Obrigado.',
 'pt', 'modification', 'medium', 'ai-reply-ready',
 'Bom dia Ricardo, temos um quarto Deluxe disponível para o fim de semana de 20 de julho. O custo adicional em relação ao Standard seria de €55 por noite. O quarto Deluxe inclui banheira de hidromassagem e vista para o mar. Deseja efectuar o upgrade? Com os melhores cumprimentos.',
 'conv-pt-003'),

-- ── English in-stay requests (6) ─────────────────────────────────────────────
('George Thompson', 'WhatsApp', 'inbound',
 'Extra towels needed',
 'Hi, room 204 here. Could we please get some extra towels sent up? We''ve been at the beach all day. Thanks!',
 'en', 'information', 'low', 'ai-reply-ready',
 'Of course, George! We''ll send up a fresh set of towels to room 204 right away. Is there anything else you need? Enjoy the rest of your evening!',
 'conv-en-in-001'),

('Emma Williams', 'WhatsApp', 'inbound',
 'Shower not draining — room 308',
 'Hello, the shower in our room (308) is draining very slowly, almost flooding. Can someone come and look at it please?',
 'en', 'maintenance', 'high', 'ai-reply-ready',
 'Hi Emma, we''re so sorry about that! Our maintenance team will be at room 308 within 15 minutes to fix the drain. Thank you for letting us know promptly — we''ll get it sorted straight away.',
 'conv-en-in-002'),

('Oliver Jones', 'WhatsApp', 'inbound',
 'Late checkout request',
 'Good morning! Is it possible to have a late checkout at 1pm instead of 11am tomorrow? We have a late flight. Happy to pay if needed.',
 'en', 'modification', 'low', 'ai-reply-ready',
 'Good morning Oliver! We''d be happy to arrange a late checkout until 1pm at no extra charge given availability. I''ve noted it on your booking — just confirm at reception on the day. Have a great final day with us!',
 'conv-en-in-003'),

('Charlotte Brown', 'Email', 'inbound',
 'Room service menu — dinner',
 'Hello, I''d like to order dinner to my room (209) this evening around 8pm. Could you send me the room service menu? Also do you have vegetarian options?',
 'en', 'information', 'low', 'ai-reply-ready',
 'Hello Charlotte! We''d be happy to serve dinner to room 209. Our room service is available until 10:30pm and we do have an excellent selection of vegetarian dishes. I''ll send our menu to your room shortly, or you can view it on the in-room tablet. What time would you like your meal to arrive?',
 'conv-en-in-004'),

('William Evans', 'WhatsApp', 'inbound',
 'Noise from next room at night',
 'Hi, there''s quite a lot of noise coming from the room next to ours tonight, it''s past midnight. Could you please ask them to be quieter? Room 205.',
 'en', 'complaint', 'high', 'ai-reply-ready',
 'Hi William, we sincerely apologise for the disturbance. Our night manager is attending to this right now and will ask the neighbouring guests to keep the noise down immediately. Thank you for letting us know. If the noise continues please don''t hesitate to call reception again.',
 'conv-en-in-005'),

('Amelia Taylor', 'Email', 'inbound',
 'Broken TV remote — room 107',
 'Hello, the TV remote in our room doesn''t seem to be working. We''ve replaced the batteries but it''s still not responding. Could someone bring a replacement please?',
 'en', 'maintenance', 'low', 'ai-reply-ready',
 'Hello Amelia! Not to worry — we''ll have a replacement remote sent up to room 107 within the next 10 minutes. Sorry for the inconvenience! Let us know if there''s anything else we can help with.',
 'conv-en-in-006'),

-- ── Compliments (4) ──────────────────────────────────────────────────────────
('Sophie Leclerc', 'Email', 'inbound',
 'Wonderful stay — thank you!',
 'Dear team, I just wanted to take a moment to say how much we enjoyed our stay with you last weekend. The room was spotless, the breakfast was delicious, and Pierre at the reception desk went above and beyond to help us arrange a surprise anniversary dinner. We will definitely be back. Thank you!',
 'en', 'compliment', 'low', 'ai-reply-ready',
 'Dear Sophie, what a lovely message to receive — thank you so much! It is always wonderful to hear when our team''s efforts make a real difference to our guests'' experiences. I will make sure to pass your kind words on to Pierre personally. We very much look forward to welcoming you back for another special occasion. Warmest regards.',
 'conv-comp-001'),

('Hans Becker', 'Booking.com', 'inbound',
 'Ausgezeichneter Service',
 'Wir haben unseren Aufenthalt sehr genossen. Das Zimmer war sauber und komfortabel, das Personal äußerst freundlich und hilfsbereit. Das Frühstücksbuffet war hervorragend. Wir kommen gerne wieder!',
 'de', 'compliment', 'low', 'auto-resolved',
 NULL,
 'conv-comp-002'),

('María González', 'WhatsApp', 'inbound',
 'Excelente experiencia',
 'Hola! Quería agradecerles el trato tan amable que recibimos durante nuestra estancia. La habitación era preciosa y el personal muy atento. ¡Volveremos seguro! 😊',
 'es', 'compliment', 'low', 'auto-resolved',
 NULL,
 'conv-comp-003'),

('Ana Costa', 'Email', 'inbound',
 'Estadia perfeita',
 'Boa tarde, só queria dizer que ficámos absolutamente encantados com a vossa hospitalidade e com a qualidade do hotel. O pequeno-almoço foi excelente e o quarto muito confortável. Até à próxima! Um abraço.',
 'pt', 'compliment', 'low', 'auto-resolved',
 NULL,
 'conv-comp-004'),

-- ── Outbound replies (4) ─────────────────────────────────────────────────────
('Claire Moreau', 'Email', 'outbound',
 'Re: Demande d''annulation — réservation du 15 mai',
 'Chère Madame Moreau, nous avons bien reçu votre demande d''annulation. Compte tenu des circonstances, nous vous confirmons l''annulation et le remboursement intégral sous 5 à 7 jours ouvrés. Nous espérons vous accueillir prochainement. Cordialement.',
 'fr', 'cancellation', 'high', 'replied',
 NULL, 'conv-fr-001'),

('James Wilson', 'Email', 'outbound',
 'Re: Parking availability for our stay',
 'Dear James, great news — we do have on-site parking at €15/night. Spaces are limited so we recommend reserving in advance. Looking forward to welcoming you on June 10th! Best regards.',
 'en', 'information', 'low', 'replied',
 NULL, 'conv-en-001'),

('Klaus Müller', 'Email', 'outbound',
 'Re: Lärm in der Nacht — Zimmer 203',
 'Sehr geehrter Herr Müller, wir entschuldigen uns aufrichtig für den Lärm. Wir haben das Problem sofort behoben. Als Geste unserer Entschuldigung laden wir Sie zu einem Abendessen in unserem Restaurant ein. Hochachtungsvoll.',
 'de', 'complaint', 'high', 'replied',
 NULL, 'conv-de-001'),

('Charlotte Evans', 'WhatsApp', 'outbound',
 'Re: Airport shuttle — late arrival',
 'Hi Charlotte! Your airport transfer is confirmed for Friday at 11:30pm. Driver will wait at Arrivals with a sign. See you soon!',
 'en', 'information', 'medium', 'replied',
 NULL, 'conv-en-002');

-- =============================================================================
-- TASKS (15 — linked to some messages above)
-- =============================================================================

INSERT INTO tasks
  (title, description, category, priority, status, assigned_to,
   room_number, source_type, due_date, completed_at)
VALUES

-- Urgent maintenance (3)
('Fix shower drain — Room 308',
 'Guest reported shower almost flooding. Drain blocked.',
 'maintenance', 'urgent', 'in-progress', 'Carlos Vega',
 '308', 'guest-request',
 now() + interval '2 hours', NULL),

('Repair AC unit — Room 105',
 'AC not working since yesterday. Guest complained of heat.',
 'maintenance', 'urgent', 'todo', 'Carlos Vega',
 '105', 'guest-request',
 now() + interval '1 hour', NULL),

('Hot water issue — Room 302',
 'No hot water from shower since this morning.',
 'maintenance', 'urgent', 'todo', 'Carlos Vega',
 '302', 'guest-request',
 now() + interval '30 minutes', NULL),

-- Housekeeping (4)
('Deep clean — Room 107',
 'Guest reported room not cleaned properly on check-in. Full deep clean required.',
 'housekeeping', 'normal', 'in-progress', 'Fatima Al-Hassan',
 '107', 'guest-request',
 now() + interval '1 hour', NULL),

('Turndown service — Floor 3',
 'Scheduled evening turndown for all occupied floor 3 rooms.',
 'housekeeping', 'low', 'todo', 'Jean-Paul Marin',
 NULL, 'scheduled',
 now() + interval '3 hours', NULL),

('Replace minibar — Room 210',
 'Minibar needs full restock after guest checkout.',
 'housekeeping', 'low', 'todo', 'Fatima Al-Hassan',
 '210', 'scheduled',
 now() + interval '2 hours', NULL),

('Extra towels delivered — Room 204',
 'Guest requested extra beach towels.',
 'housekeeping', 'low', 'done', 'Jean-Paul Marin',
 '204', 'guest-request',
 NULL, now() - interval '30 minutes'),

-- Scheduled tasks (3)
('Weekly boiler inspection',
 'Routine inspection of boiler room and water heating system.',
 'maintenance', 'normal', 'todo', 'Carlos Vega',
 NULL, 'scheduled',
 now() + interval '2 days', NULL),

('Pool pH check and treatment',
 'Bi-daily pool water quality check and chemical adjustment.',
 'maintenance', 'normal', 'todo', 'Carlos Vega',
 NULL, 'scheduled',
 now() + interval '6 hours', NULL),

('Monthly fire safety check',
 'Test all fire alarms, emergency lighting, and exit signs throughout the building.',
 'maintenance', 'normal', 'todo', 'Carlos Vega',
 NULL, 'scheduled',
 now() + interval '5 days', NULL),

-- Front-desk tasks (2)
('Prepare VIP welcome package — Room 308',
 'Guests celebrating anniversary. Arrange champagne, rose petals, and welcome card.',
 'front-desk', 'normal', 'in-progress', 'Pierre Lecomte',
 '308', 'manual',
 now() + interval '2 hours', NULL),

('Process group check-in — 10 guests',
 'Corporate group arriving 3pm. Prepare key cards, welcome letters, and meeting room access.',
 'front-desk', 'normal', 'todo', 'Ana Pereira',
 NULL, 'manual',
 now() + interval '4 hours', NULL),

-- Completed tasks (3)
('Fix TV remote — Room 107',
 'Guest reported broken TV remote. Replacement sent up.',
 'maintenance', 'low', 'done', 'Carlos Vega',
 '107', 'guest-request',
 NULL, now() - interval '45 minutes'),

('Late checkout confirmed — Room 302',
 'Guest requested late checkout 1pm. Approved and noted.',
 'front-desk', 'low', 'done', 'Pierre Lecomte',
 '302', 'guest-request',
 NULL, now() - interval '1 hour'),

('Noise complaint resolved — Room 203',
 'Night manager addressed noise complaint. Guests in neighbouring room asked to quiet down.',
 'front-desk', 'normal', 'done', 'Pierre Lecomte',
 '203', 'guest-request',
 NULL, now() - interval '6 hours');

-- =============================================================================
-- REVIEWS (15 — mix of platforms and ratings)
-- =============================================================================

INSERT INTO reviews (guest_name, platform, rating, review_text, language, ai_response, response_status) VALUES

('Sophie T.',         'TripAdvisor', 5, 'Absolutely wonderful stay! The room was immaculate, staff incredibly welcoming, and the breakfast spread was one of the best I''ve had. The sea view from our room was breathtaking. Will definitely return!', 'en',
 'Dear Sophie, what a beautiful review — thank you so much! Hearing that you enjoyed every aspect of your stay truly makes our team''s day. We look forward to welcoming you back and hopefully making each visit better than the last. Warm regards, The Management.', 'approved'),

('Jean-Pierre M.',    'Booking.com', 4, 'Très bon séjour dans l''ensemble. Chambre propre et confortable, personnel aimable. Le petit déjeuner est copieux et varié. Seul bémol : le Wi-Fi était un peu lent le soir. Je recommande.', 'fr',
 'Cher Jean-Pierre, merci pour votre retour positif ! Nous prenons note du problème de Wi-Fi le soir et travaillons à améliorer notre infrastructure réseau. Nous espérons vous accueillir à nouveau prochainement. Cordialement.', 'approved'),

('Klaus W.',          'Google',      3, 'Gemischte Erfahrung. Das Zimmer war sauber und das Frühstück gut, aber die Klimaanlage hat nicht richtig funktioniert und der Service an der Rezeption war manchmal langsam. Für den Preis erwartet man etwas mehr.', 'de',
 'Sehr geehrter Herr W., vielen Dank für Ihr ehrliches Feedback. Es tut uns leid, dass die Klimaanlage und der Rezeptionsservice Ihren Erwartungen nicht entsprochen haben. Wir haben beide Punkte als Verbesserungsbereiche notiert. Wir hoffen, Sie bei einem nächsten Besuch überzeugen zu können. Hochachtungsvoll.', 'draft'),

('María L.',          'TripAdvisor', 5, '¡Hotel increíble! La habitación era preciosa con vistas al mar, el personal muy amable y atento. El desayuno buffet tiene una selección excelente. Lo recomendaría sin duda a cualquier viajero. ¡Volveremos!', 'es',
 'Querida María, ¡muchas gracias por sus maravillosas palabras! Nos alegra enormemente saber que disfrutó de la vista y del desayuno. Será un placer recibirla nuevamente. Saludos cordiales.', 'approved'),

('Tom H.',            'Booking.com', 2, 'Disappointing stay. Room was smaller than the photos suggested, and there was a persistent musty smell. The air conditioning made a loud rattling noise at night which kept me awake. Staff were pleasant but couldn''t resolve the issues quickly.', 'en',
 'Dear Tom, we sincerely apologise for the issues you experienced. The air conditioning noise and room condition are clearly unacceptable, and we have flagged both for immediate rectification. We would love the opportunity to make things right — please contact us directly to discuss a goodwill gesture. Sincerely, The Management.', 'approved'),

('Isabelle F.',       'Google',      4, 'Charmant petit hôtel avec un excellent rapport qualité-prix. Personnel attentionné, chambres bien décorées. L''emplacement est idéal. Légère déception avec la salle de bain un peu vieillotte mais rien de rédhibitoire. Je reviendrai.', 'fr',
 'Chère Isabelle, merci pour ce retour bienveillant ! Nous notons votre commentaire sur la salle de bain et prévoyons effectivement une rénovation des salles de bains cet automne. Au plaisir de vous revoir !', 'draft'),

('Hans G.',           'TripAdvisor', 1, 'Schreckliches Erlebnis. Das Zimmer war schmutzig, die Klimaanlage defekt, und das Personal war unfreundlich. Dazu kam eine falsche Abbuchung auf meiner Kreditkarte. Ich kann dieses Hotel nicht empfehlen und werde keine weiteren Aufenthalte buchen.', 'de',
 'Sehr geehrter Herr G., wir sind erschüttert über Ihre Schilderung und entschuldigen uns aufrichtig. Dies entspricht in keiner Weise unserem Standard. Wir haben die fehlerhafte Abbuchung bereits korrigiert und leiten eine interne Untersuchung ein. Bitte nehmen Sie direkten Kontakt mit unserer Direktion auf, damit wir die Situation persönlich klären können.', 'approved'),

('Oliver P.',         'Booking.com', 5, 'Exceptional in every way. From the moment we arrived, the staff were attentive and professional. Our suite was stunning with a private terrace and jacuzzi. The in-room breakfast was divine. Highly recommend for a special occasion.', 'en',
 'Dear Oliver, thank you for this glowing review! Your kind words about our suite and breakfast service mean the world to our team. We hope to welcome you back for another special occasion very soon. Best wishes.', 'approved'),

('Chiara R.',         'Google',      4, 'Soggiorno piacevole, camera pulita e personale gentile. La colazione è abbondante e varia. Unico neo: il parcheggio è un po'' lontano dall''hotel. Nel complesso consigliato.', 'it',
 'Cara Chiara, grazie mille per la sua recensione! Siamo felici che il soggiorno sia stato piacevole. Prendiamo nota del commento sul parcheggio e stiamo valutando soluzioni per migliorare il servizio. A presto!', 'draft'),

('Emma S.',           'TripAdvisor', 5, 'Perfect weekend getaway! The hotel is beautifully maintained, the spa was incredibly relaxing, and the restaurant food was outstanding. Special thanks to Maria at the front desk who was absolutely wonderful throughout our stay.', 'en',
 'Dear Emma, what a lovely review — thank you! We will pass your special mention of Maria on to her personally; she will be thrilled. We hope your next visit is just as perfect. Warmly.', 'approved'),

('Pedro A.',          'Booking.com', 3, 'Estadia razoável. Quarto limpo mas pequeno para o preço cobrado. O atendimento foi simpático mas o check-in demorou bastante. O pequeno-almoço foi bom. Esperava mais pela localização.', 'pt',
 'Caro Pedro, obrigados pelo seu feedback honesto. Lamentamos que o quarto não tenha correspondido às suas expectativas e que o check-in tenha demorado. Estamos a trabalhar para agilizar o processo de chegada. Esperamos tê-lo novamente e poder surpreendê-lo positivamente.', 'draft'),

('Greta M.',          'Google',      5, 'Wunderschönes Hotel! Alles war perfekt — das Zimmer, das Frühstück, der Service. Besonders beeindruckt hat uns das Spa. Wir kommen definitiv wieder!', 'de',
 'Liebe Greta, vielen herzlichen Dank für Ihre wundervolle Bewertung! Es freut uns sehr, dass das Spa Ihnen so gut gefallen hat. Wir freuen uns sehr auf Ihren nächsten Besuch!', 'approved'),

('James R.',          'TripAdvisor', 2, 'Had high hopes but was let down. The room was okay but the noise from the street was unbearable at night and the air conditioning was very noisy. Breakfast was decent. Would not return at this price point.', 'en',
 'Dear James, we are sorry to hear your stay did not meet expectations. Noise is something we take very seriously and we are investigating ways to improve soundproofing on the lower floors. We appreciate your candid feedback and hope you will give us another chance in the future. Sincerely.', 'draft'),

('Lucía H.',          'Booking.com', 4, 'Muy buena experiencia en general. Habitación cómoda y limpia, desayuno excelente y personal muy amable. La ubicación es perfecta para visitar la ciudad. Solo faltó un poco más de variedad en el menú del restaurante.', 'es',
 'Querida Lucía, muchas gracias por su valoración y por sus sugerencias sobre el menú del restaurante. Estamos trabajando en ampliar la oferta gastronómica. ¡Esperamos volver a verla pronto!', 'approved'),

('Ana B.',            'Google',      5, 'Hotel fantástico! Desde o momento da chegada, sentimo-nos como em casa. O quarto tinha uma vista deslumbrante, a cama era muito confortável e o pequeno-almoço era delicioso. Recomendo vivamente a todos!', 'pt',
 'Cara Ana, obrigados por palavras tão carinhosas! É maravilhoso saber que se sentiu em casa. Será sempre um prazer recebê-la novamente. Um grande abraço da equipa do hotel.', 'approved');

-- =============================================================================
-- INSIGHTS (5 initial AI insights)
-- =============================================================================

INSERT INTO insights (text, category, action_type, action_id, priority, is_read) VALUES

('Occupancy for this weekend is at 91% — consider increasing rates by 8–12% for the remaining 2 available rooms to maximise RevPAR.',
 'pricing', 'view_reservations', NULL, 'high', false),

('3 urgent maintenance tasks are unresolved. Room 302 (no hot water) and Room 105 (broken AC) have guests currently checked in — prioritise immediately.',
 'operations', 'view_tasks', NULL, 'high', false),

('New 1-star review on TripAdvisor from Hans G. mentions a billing error and dirty room. Recommend escalated personal response from management today.',
 'review-alert', 'view_reviews', NULL, 'high', false),

('Good morning! Today: 14 check-ins, 8 check-outs, 3 VIP guests. Occupancy tonight: 78%. 2 unread urgent messages in your inbox.',
 'daily-briefing', NULL, NULL, 'medium', false),

('Channel mix this month: 62% Booking.com, 21% Direct, 10% Expedia, 7% other. Consider a direct booking incentive (e.g. free breakfast) to shift 5% away from OTAs and reduce commission costs.',
 'pricing', NULL, NULL, 'medium', false);
