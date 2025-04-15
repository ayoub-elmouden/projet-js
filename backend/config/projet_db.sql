-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 13, 2025 at 03:57 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `projet_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `inf_enseignants`
--

CREATE TABLE `inf_enseignants` (
  `Id_Prof` int(11) NOT NULL,
  `Nom` varchar(50) NOT NULL,
  `Prenom` varchar(50) NOT NULL,
  `Id_mat` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inf_etu`
--

CREATE TABLE `inf_etu` (
  `Id_etu` int(11) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `Nom` varchar(50) DEFAULT NULL,
  `Prenom` varchar(50) DEFAULT NULL,
  `Date_Naiss` date DEFAULT NULL,
  `Sexe` varchar(50) DEFAULT NULL,
  `Etablissement` varchar(50) DEFAULT NULL,
  `Id_fil` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inf_fil`
--

CREATE TABLE `inf_fil` (
  `Id_fil` int(11) NOT NULL,
  `Filiere` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inf_fil`
--

INSERT INTO `inf_fil` (`Id_fil`, `Filiere`) VALUES
(1, '2IDL'),
(3, 'BCG'),
(2, 'PC');

-- --------------------------------------------------------

--
-- Table structure for table `inf_mat`
--

CREATE TABLE `inf_mat` (
  `Id_mat` int(11) NOT NULL,
  `Matiere` varchar(50) NOT NULL,
  `Id_fil` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inf_mat`
--

INSERT INTO `inf_mat` (`Id_mat`, `Matiere`, `Id_fil`) VALUES
(1, 'Systeme d\'exploitation 2', 1),
(2, 'Algebre relationnelle et langage SQL', 1),
(3, 'Developemen web js', 1),
(4, 'Structures de donnees', 1),
(5, 'POO avec C++', 1),
(6, 'Mecanique Quantique', 2),
(7, 'Optique ondulatoire', 2),
(8, 'Electronique Analogique', 2),
(9, 'Analyse Numerique', 2),
(10, 'Electronique Numerique', 2),
(11, 'Systematique et Notion de Biodiversite', 3),
(12, 'Enzymologie et Biochimie Metabolique', 3),
(13, 'Physiologie Vegetale', 3),
(14, 'Physiologie Animale', 3),
(15, 'Biologie Moleculaire et Genetique', 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `inf_enseignants`
--
ALTER TABLE `inf_enseignants`
  ADD PRIMARY KEY (`Id_Prof`),
  ADD KEY `Id_mat` (`Id_mat`);

--
-- Indexes for table `inf_etu`
--
ALTER TABLE `inf_etu`
  ADD PRIMARY KEY (`Id_etu`),
  ADD KEY `Id_fil` (`Id_fil`);

--
-- Indexes for table `inf_fil`
--
ALTER TABLE `inf_fil`
  ADD PRIMARY KEY (`Id_fil`),
  ADD UNIQUE KEY `Filiere` (`Filiere`);

--
-- Indexes for table `inf_mat`
--
ALTER TABLE `inf_mat`
  ADD PRIMARY KEY (`Id_mat`),
  ADD KEY `Id_fil` (`Id_fil`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `inf_enseignants`
--
ALTER TABLE `inf_enseignants`
  MODIFY `Id_Prof` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inf_etu`
--
ALTER TABLE `inf_etu`
  MODIFY `Id_etu` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inf_fil`
--
ALTER TABLE `inf_fil`
  MODIFY `Id_fil` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `inf_mat`
--
ALTER TABLE `inf_mat`
  MODIFY `Id_mat` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `inf_enseignants`
--
ALTER TABLE `inf_enseignants`
  ADD CONSTRAINT `inf_enseignants_ibfk_1` FOREIGN KEY (`Id_mat`) REFERENCES `inf_mat` (`Id_mat`);

--
-- Constraints for table `inf_etu`
--
ALTER TABLE `inf_etu`
  ADD CONSTRAINT `inf_etu_ibfk_1` FOREIGN KEY (`Id_fil`) REFERENCES `inf_fil` (`Id_fil`);

--
-- Constraints for table `inf_mat`
--
ALTER TABLE `inf_mat`
  ADD CONSTRAINT `inf_mat_ibfk_1` FOREIGN KEY (`Id_fil`) REFERENCES `inf_fil` (`Id_fil`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
