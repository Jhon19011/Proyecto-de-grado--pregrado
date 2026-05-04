-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: proyectosustancias
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'be9229ef-11ce-11f1-b0ab-ac198e8ab0e1:1-582';

--
-- Table structure for table `alertas`
--

DROP TABLE IF EXISTS `alertas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alertas` (
  `idalerta` int NOT NULL AUTO_INCREMENT,
  `mensaje` text NOT NULL,
  `tipo` varchar(20) DEFAULT NULL,
  `leida` tinyint(1) DEFAULT '0',
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sede_id` int DEFAULT NULL,
  `idsustancia` int DEFAULT NULL,
  `idinventario_sustancia` int DEFAULT NULL,
  PRIMARY KEY (`idalerta`),
  KEY `sede_id` (`sede_id`),
  KEY `idsustancia` (`idsustancia`),
  KEY `idinventario_sustancia` (`idinventario_sustancia`),
  CONSTRAINT `alertas_ibfk_1` FOREIGN KEY (`sede_id`) REFERENCES `sede` (`idsede`),
  CONSTRAINT `alertas_ibfk_2` FOREIGN KEY (`idsustancia`) REFERENCES `sustancia` (`idsustancia`),
  CONSTRAINT `alertas_ibfk_3` FOREIGN KEY (`idinventario_sustancia`) REFERENCES `inventario_sustancia` (`idinventario_sustancia`)
) ENGINE=InnoDB AUTO_INCREMENT=139 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `autorizacion_sustancia`
--

DROP TABLE IF EXISTS `autorizacion_sustancia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `autorizacion_sustancia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sede_id` int NOT NULL,
  `sustancia_id` int NOT NULL,
  `autorizada` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `sustancia_id` (`sustancia_id`,`sede_id`),
  KEY `sede_id` (`sede_id`),
  CONSTRAINT `autorizacion_sustancia_ibfk_1` FOREIGN KEY (`sede_id`) REFERENCES `sede` (`idsede`),
  CONSTRAINT `autorizacion_sustancia_ibfk_2` FOREIGN KEY (`sustancia_id`) REFERENCES `sustancia` (`idsustancia`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventario_sustancia`
--

DROP TABLE IF EXISTS `inventario_sustancia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario_sustancia` (
  `idinventario_sustancia` int NOT NULL AUTO_INCREMENT,
  `sustancia` int DEFAULT NULL,
  `tabla` int DEFAULT NULL,
  `cantidad` decimal(10,2) DEFAULT NULL,
  `cantidadremanente` decimal(10,2) DEFAULT NULL,
  `gastototal` decimal(10,2) DEFAULT NULL,
  `ubicaciondealmacenamiento` varchar(45) DEFAULT NULL,
  `estado` tinyint DEFAULT '1',
  `cedula_principal` int DEFAULT NULL,
  `estado_uso` enum('Nuevo','En uso','Agotado','Traslado / Nuevo','Traslado / En uso','Traslado / Agotado') DEFAULT 'Nuevo',
  `lote` varchar(100) DEFAULT NULL,
  `fechadevencimiento` date DEFAULT NULL,
  `observaciones` text,
  PRIMARY KEY (`idinventario_sustancia`),
  KEY `sustancia_idx` (`sustancia`),
  KEY `tabla_idx` (`tabla`),
  CONSTRAINT `sustancia` FOREIGN KEY (`sustancia`) REFERENCES `sustancia` (`idsustancia`),
  CONSTRAINT `tabla` FOREIGN KEY (`tabla`) REFERENCES `tablas` (`idtablas`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `movimientos_sustancia`
--

DROP TABLE IF EXISTS `movimientos_sustancia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_sustancia` (
  `idmovimiento` int NOT NULL AUTO_INCREMENT,
  `inventario_sustancia_id` int NOT NULL,
  `inventario_origen_id` int DEFAULT NULL,
  `inventario_destino_id` int DEFAULT NULL,
  `tipo` enum('entrada','salida') NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `motivo` varchar(255) DEFAULT NULL,
  `usuario` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idmovimiento`),
  KEY `inventario_sustancia_id` (`inventario_sustancia_id`),
  CONSTRAINT `movimientos_sustancia_ibfk_1` FOREIGN KEY (`inventario_sustancia_id`) REFERENCES `inventario_sustancia` (`idinventario_sustancia`)
) ENGINE=InnoDB AUTO_INCREMENT=161 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `idrol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idrol`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sede`
--

DROP TABLE IF EXISTS `sede`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sede` (
  `idsede` int NOT NULL AUTO_INCREMENT,
  `nombre_sede` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idsede`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sustancia`
--

DROP TABLE IF EXISTS `sustancia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sustancia` (
  `idsustancia` int NOT NULL AUTO_INCREMENT,
  `numero` int DEFAULT NULL,
  `codigo` varchar(45) DEFAULT NULL,
  `nombreComercial` varchar(45) DEFAULT NULL,
  `marca` varchar(45) DEFAULT NULL,
  `CAS` varchar(45) DEFAULT NULL,
  `clasedepeligrosegunonu` varchar(45) DEFAULT NULL,
  `categoriaIARC` varchar(45) DEFAULT NULL,
  `estado` varchar(45) DEFAULT NULL,
  `presentacion` varchar(45) DEFAULT NULL,
  `sede_s` int DEFAULT NULL,
  `PDF` varchar(45) DEFAULT NULL,
  `tipo` enum('comun','controlada') NOT NULL DEFAULT 'comun',
  `esControlada` tinyint(1) DEFAULT '0',
  `pdf_seguridad` varchar(255) DEFAULT NULL,
  `pdf_tecnico` varchar(255) DEFAULT NULL,
  `unidad` int DEFAULT NULL,
  PRIMARY KEY (`idsustancia`),
  KEY `fk_sustancia_sede_s` (`sede_s`),
  KEY `fk_unidad` (`unidad`),
  CONSTRAINT `fk_sustancia_sede_s` FOREIGN KEY (`sede_s`) REFERENCES `sede` (`idsede`),
  CONSTRAINT `fk_unidad` FOREIGN KEY (`unidad`) REFERENCES `unidades` (`idunidad`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tablas`
--

DROP TABLE IF EXISTS `tablas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tablas` (
  `idtablas` int NOT NULL AUTO_INCREMENT,
  `nombretabla` varchar(45) DEFAULT NULL,
  `sedeT` int DEFAULT NULL,
  `principal` tinyint(1) DEFAULT '0',
  `estado` tinyint DEFAULT '1',
  PRIMARY KEY (`idtablas`),
  KEY `sede_idx` (`sedeT`),
  CONSTRAINT `sede` FOREIGN KEY (`sedeT`) REFERENCES `sede` (`idsede`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unidades`
--

DROP TABLE IF EXISTS `unidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unidades` (
  `idunidad` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `estado` tinyint DEFAULT '1',
  PRIMARY KEY (`idunidad`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `idusuario` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(45) DEFAULT NULL,
  `apellidos` varchar(45) DEFAULT NULL,
  `correo` varchar(45) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `rol` int DEFAULT NULL,
  `sedeU` int DEFAULT NULL,
  PRIMARY KEY (`idusuario`),
  KEY `rol_idx` (`rol`),
  KEY `sede_idx` (`sedeU`),
  CONSTRAINT `rol` FOREIGN KEY (`rol`) REFERENCES `rol` (`idrol`),
  CONSTRAINT `sedeU` FOREIGN KEY (`sedeU`) REFERENCES `sede` (`idsede`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-04  8:35:51
