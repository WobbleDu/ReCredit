-- Создание таблицы _User
CREATE TABLE _User (
    ID_User SERIAL PRIMARY KEY,
    Login VARCHAR(50) NOT NULL,
    Password VARCHAR(50) NOT NULL,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    BirthDate DATE NOT NULL,
    PhoneNumber VARCHAR(50) NOT NULL,
    INN VARCHAR(50) NOT NULL,
    PassportSerie INT NOT NULL,
    PassportNumber INT NOT NULL,
    Income DECIMAL NOT NULL,
    Country VARCHAR(50) NOT NULL
);

-- Создание таблицы Offers
CREATE TABLE Offers (
    ID_Offer SERIAL PRIMARY KEY,
    Owner_ID INT NULL,
    Guest_ID INT NULL,
    Type VARCHAR(50) NOT NULL,
    CreditSum DECIMAL NOT NULL,
    InterestRate DECIMAL NOT NULL,
    State SMALLINT NOT NULL CHECK (State IN (0, 1, 2)), -- 0-не начато, 1-в работе, 2-завершено
    DateStart DATE NULL,
    DateEnd DATE NULL,
    CONSTRAINT FK_Owner FOREIGN KEY (Owner_ID) REFERENCES _User(ID_User) ON DELETE SET NULL,  
    CONSTRAINT FK_Guest FOREIGN KEY (Guest_ID) REFERENCES _User(ID_User) ON DELETE SET NULL
);

-- Создание таблицы Payments
CREATE TABLE Payments (
    ID_Payment SERIAL PRIMARY KEY,
    Offer_ID INT NOT NULL,
    DateTime DATE NOT NULL,
    Summary DECIMAL NOT NULL,
    Remain DECIMAL NOT NULL,
    CONSTRAINT FK_Offer FOREIGN KEY (Offer_ID) REFERENCES Offers(ID_Offer) ON DELETE CASCADE
);

-- Создание таблицы Notifications
CREATE TABLE Notifications (
    ID_Notifications SERIAL PRIMARY KEY,
    User_ID INT NOT NULL,
    Text TEXT NOT NULL,
    Flag BOOLEAN NOT NULL,
    DateTime DATE NOT NULL,
    CONSTRAINT FK_User FOREIGN KEY (User_ID) REFERENCES _User(ID_User) ON DELETE CASCADE
);