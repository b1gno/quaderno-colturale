-- ============================================
-- Database: Quaderno di Campo Digitale
-- ============================================

-- Creazione del database
CREATE DATABASE IF NOT EXISTS quaderno_campo 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_general_ci;

-- Selezione del database
USE quaderno_campo;

-- ============================================
-- Tabella: campi
-- Descrizione: Gestione dei campi agricoli
-- ============================================
CREATE TABLE campi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    superficie DECIMAL(10,2) COMMENT 'Superficie in ettari',
    tipo_terreno VARCHAR(50),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- Tabella: coltivazioni
-- Descrizione: Coltivazioni associate ai campi
-- ============================================
CREATE TABLE coltivazioni (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_campo INT NOT NULL,
    tipo_coltura VARCHAR(100) NOT NULL,
    data_semina DATE,
    periodo VARCHAR(50),
    stato VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_campo) REFERENCES campi(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- Tabella: prodotti
-- Descrizione: Prodotti fitosanitari e materiali
-- ============================================
CREATE TABLE prodotti (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    categoria ENUM('fitosanitario', 'concime', 'diserbante', 'altro') DEFAULT 'altro',
    unita_misura VARCHAR(20) COMMENT 'Es: kg, litri, quintali',
    scorta_minima DECIMAL(10,2) DEFAULT 0,
    quantita_disponibile DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- Tabella: attivita
-- Descrizione: Registro delle attività svolte
-- ============================================
CREATE TABLE attivita (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data DATE NOT NULL,
    id_campo INT NOT NULL,
    id_coltivazione INT,
    descrizione TEXT,
    tipo_attivita VARCHAR(50) COMMENT 'Es: semina, concimazione, trattamento',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_campo) REFERENCES campi(id),
    FOREIGN KEY (id_coltivazione) REFERENCES coltivazioni(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- Tabella: utilizzo_prodotti
-- Descrizione: Prodotti utilizzati per ogni attività
-- ============================================
CREATE TABLE utilizzo_prodotti (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_attivita INT NOT NULL,
    id_prodotto INT NOT NULL,
    quantita_utilizzata DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_attivita) REFERENCES attivita(id) ON DELETE CASCADE,
    FOREIGN KEY (id_prodotto) REFERENCES prodotti(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- Tabella: movimenti_magazzino
-- Descrizione: Storico movimenti di magazzino
-- ============================================
CREATE TABLE movimenti_magazzino (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_prodotto INT NOT NULL,
    tipo_movimento ENUM('carico', 'scarico') NOT NULL,
    quantita DECIMAL(10,2) NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    FOREIGN KEY (id_prodotto) REFERENCES prodotti(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- Indici per migliorare le performance
-- ============================================
CREATE INDEX idx_attivita_data ON attivita(data);
CREATE INDEX idx_attivita_campo ON attivita(id_campo);
CREATE INDEX idx_coltivazioni_campo ON coltivazioni(id_campo);
CREATE INDEX idx_movimenti_prodotto ON movimenti_magazzino(id_prodotto);
CREATE INDEX idx_movimenti_data ON movimenti_magazzino(data);

-- ============================================
-- Dati di esempio (opzionali)
-- ============================================

-- Inserimento campi di esempio
INSERT INTO campi (nome, superficie, tipo_terreno, note) VALUES
('Campo Nord', 5.50, 'Argilloso', 'Campo principale per cereali'),
('Campo Sud', 3.20, 'Sabbioso', 'Adatto per ortaggi'),
('Campo Est', 7.00, 'Medio impasto', 'Zona pianeggiante');

-- Inserimento coltivazioni di esempio
INSERT INTO coltivazioni (id_campo, tipo_coltura, data_semina, periodo, stato) VALUES
(1, 'Grano', '2024-10-15', 'Autunno-Inverno', 'In crescita'),
(2, 'Pomodori', '2024-04-20', 'Primavera-Estate', 'In produzione'),
(3, 'Mais', '2024-05-10', 'Primavera-Estate', 'In crescita');

-- Inserimento prodotti di esempio
INSERT INTO prodotti (nome, categoria, unita_misura, scorta_minima, quantita_disponibile) VALUES
('Concime NPK 15-15-15', 'concime', 'kg', 100, 500),
('Diserbante selettivo', 'diserbante', 'litri', 20, 80),
('Fungicida rameico', 'fitosanitario', 'kg', 50, 150),
('Insetticida piretroide', 'fitosanitario', 'litri', 10, 45),
('Urea 46%', 'concime', 'quintali', 5, 20);

-- Inserimento attività di esempio
INSERT INTO attivita (data, id_campo, id_coltivazione, descrizione, tipo_attivita) VALUES
('2024-10-15', 1, 1, 'Semina del grano con seminatrice meccanica', 'semina'),
('2024-11-05', 1, 1, 'Prima concimazione di copertura', 'concimazione'),
('2024-04-20', 2, 2, 'Trapianto piantine di pomodoro', 'trapianto');

-- Inserimento utilizzo prodotti di esempio
INSERT INTO utilizzo_prodotti (id_attivita, id_prodotto, quantita_utilizzata) VALUES
(2, 1, 150),  -- Attività 2: utilizzati 150 kg di NPK
(2, 5, 2);    -- Attività 2: utilizzati 2 quintali di Urea

-- Aggiornamento quantità disponibili dopo utilizzo
UPDATE prodotti SET quantita_disponibile = quantita_disponibile - 150 WHERE id = 1;
UPDATE prodotti SET quantita_disponibile = quantita_disponibile - 2 WHERE id = 5;

-- Inserimento movimenti magazzino corrispondenti
INSERT INTO movimenti_magazzino (id_prodotto, tipo_movimento, quantita, note) VALUES
(1, 'scarico', 150, 'Utilizzato per attività concimazione campo Nord'),
(5, 'scarico', 2, 'Utilizzato per attività concimazione campo Nord');

-- ============================================
-- Fine dello script
-- ============================================

-- Verifica tabelle create
SHOW TABLES;
