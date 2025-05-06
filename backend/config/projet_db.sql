CREATE DATABASE projet_db;
USE projet_db;


SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


CREATE TABLE `inf_enseignants` (
    `Id_Prof` INT(11) NOT NULL,
    `Nom` VARCHAR(50) NOT NULL,
    `Prenom` VARCHAR(50) NOT NULL,
    `email` VARCHAR(50) NOT NULL UNIQUE, 
    `password` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`Id_Prof`)
);


CREATE TABLE `inf_fil` (
    `Id_fil` INT(11) NOT NULL,
    `Filiere` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`Id_fil`),
    UNIQUE (`Filiere`)
);


CREATE TABLE `inf_etu` (
    `Id_etu` INT(11) NOT NULL,
    `email` VARCHAR(50) DEFAULT NULL,
    `Nom` VARCHAR(50) NOT NULL,
    `Prenom` VARCHAR(50) NOT NULL,
    `Date_Naiss` DATE DEFAULT NULL,
    `Sexe` ENUM('M', 'F', 'Autre') DEFAULT NULL,
    `Etablissement` VARCHAR(50) DEFAULT NULL,
    `Id_fil` INT(11) NOT NULL,
    `password` VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (`Id_etu`),
    FOREIGN KEY (`Id_fil`) REFERENCES `inf_fil` (`Id_fil`),
    INDEX (`Id_fil`)
);


CREATE TABLE `inf_mat` (
    `Id_mat` INT(11) NOT NULL,
    `Matiere` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`Id_mat`),
    UNIQUE (`Matiere`)
);


CREATE TABLE `fil_mat` (
    `Id_fil` INT(11) NOT NULL,
    `Id_mat` INT(11) NOT NULL,
    PRIMARY KEY (`Id_fil`, `Id_mat`),
    FOREIGN KEY (`Id_fil`) REFERENCES `inf_fil` (`Id_fil`),
    FOREIGN KEY (`Id_mat`) REFERENCES `inf_mat` (`Id_mat`)
);


CREATE TABLE `ens_mat` (
    `Id_Prof` INT(11) NOT NULL,
    `Id_mat` INT(11) NOT NULL,
    PRIMARY KEY (`Id_Prof`, `Id_mat`),
    FOREIGN KEY (`Id_Prof`) REFERENCES `inf_enseignants` (`Id_Prof`),
    FOREIGN KEY (`Id_mat`) REFERENCES `inf_mat` (`Id_mat`)
);


CREATE TABLE `exams` (
    `Id_exam` INT(11) NOT NULL AUTO_INCREMENT,
    `Titre` VARCHAR(100) NOT NULL,
    `Date` DATETIME NOT NULL,
    `Duree` INT NOT NULL CHECK (`Duree` > 0), 
    `Score_Total` INT NOT NULL CHECK (`Score_Total` >= 0),
    `Id_mat` INT(11) NOT NULL,
    `Description` TEXT NOT NULL, 
    `Target_Audience` VARCHAR(100) DEFAULT NULL, 
    `Access_Link` VARCHAR(255) NOT NULL UNIQUE, 
    PRIMARY KEY (`Id_exam`),
    FOREIGN KEY (`Id_mat`) REFERENCES `inf_mat` (`Id_mat`),
    INDEX (`Date`)
);


CREATE TABLE `questions` (
    `Id_question` INT(11) NOT NULL AUTO_INCREMENT,
    `Contenu` TEXT NOT NULL,
    `Points` INT NOT NULL CHECK (`Points` >= 0),
    `Type_Question` VARCHAR(50) NOT NULL,
    `Duration` INT NOT NULL CHECK (`Duration` > 0),
    `Media_Path` VARCHAR(255) DEFAULT NULL,
    `Expected_Answer` TEXT DEFAULT NULL,
    `Tolerance` FLOAT DEFAULT NULL, 
    PRIMARY KEY (`Id_question`)
);


CREATE TABLE `exam_questions` (
    `Id_exam` INT(11) NOT NULL,
    `Id_question` INT(11) NOT NULL,
    PRIMARY KEY (`Id_exam`, `Id_question`),
    FOREIGN KEY (`Id_exam`) REFERENCES `exams` (`Id_exam`),
    FOREIGN KEY (`Id_question`) REFERENCES `questions` (`Id_question`)
);


CREATE TABLE `inf_scores` (
    `Id_etu` INT(11) NOT NULL,
    `Id_exam` INT(11) NOT NULL,
    `Score` INT NOT NULL CHECK (`Score` >= 0),
    PRIMARY KEY (`Id_etu`, `Id_exam`), 
    FOREIGN KEY (`Id_etu`) REFERENCES `inf_etu` (`Id_etu`),
    FOREIGN KEY (`Id_exam`) REFERENCES `exams` (`Id_exam`),
    INDEX (`Id_etu`)
);


CREATE TABLE `qcm_options` (
    `Id_option` INT(11) NOT NULL AUTO_INCREMENT,
    `Id_question` INT(11) NOT NULL,
    `Option_Text` TEXT NOT NULL,
    `Is_Correct` BOOLEAN NOT NULL, 
    PRIMARY KEY (`Id_option`),
    FOREIGN KEY (`Id_question`) REFERENCES `questions` (`Id_question`)
);


CREATE TABLE `exam_attempts` (
    `Id_attempt` INT(11) NOT NULL AUTO_INCREMENT,
    `Id_etu` INT(11) NOT NULL,
    `Id_exam` INT(11) NOT NULL,
    `Latitude` DECIMAL(9,6) DEFAULT NULL, 
    `Longitude` DECIMAL(9,6) DEFAULT NULL, 
    `Start_Time` DATETIME NOT NULL, 
    PRIMARY KEY (`Id_attempt`),
    UNIQUE (`Id_etu`, `Id_exam`), 
    FOREIGN KEY (`Id_etu`) REFERENCES `inf_etu` (`Id_etu`),
    FOREIGN KEY (`Id_exam`) REFERENCES `exams` (`Id_exam`)
);


CREATE TABLE `student_responses` (
    `Id_response` INT(11) NOT NULL AUTO_INCREMENT,
    `Id_etu` INT(11) NOT NULL,
    `Id_exam` INT(11) NOT NULL,
    `Id_question` INT(11) NOT NULL,
    `Response` TEXT NOT NULL, 
    `Score` INT DEFAULT NULL CHECK (`Score` >= 0), 
    PRIMARY KEY (`Id_response`),
    FOREIGN KEY (`Id_etu`) REFERENCES `inf_etu` (`Id_etu`),
    FOREIGN KEY (`Id_exam`) REFERENCES `exams` (`Id_exam`),
    FOREIGN KEY (`Id_question`) REFERENCES `questions` (`Id_question`)
);


INSERT INTO `inf_fil` (`Id_fil`, `Filiere`) VALUES
(1, '2IDL'),
(2, 'PC'),
(3, 'BCG');


INSERT INTO `inf_mat` (`Id_mat`, `Matiere`) VALUES
(1, 'Système d_exploitation 2'),
(2, 'Algèbre relationnelle et langage SQL'),
(3, 'Développement web JS'),
(4, 'Structures de données'),
(5, 'POO avec C++'),
(6, 'Mécanique Quantique'),
(7, 'Optique ondulatoire'),
(8, 'Électronique Analogique'),
(9, 'Analyse Numérique'),
(10, 'Électronique Numérique'),
(11, 'Systématique et Notion de Biodiversité'),
(12, 'Enzymologie et Biochimie Métabolique'),
(13, 'Physiologie Végétale'),
(14, 'Physiologie Animale'),
(15, 'Biologie Moléculaire et Génétique');

COMMIT;