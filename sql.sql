CREATE TABLE `products` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` varchar(10) NOT NULL,
  `rate` int(10) NOT NULL,
  `image` varchar(100) NOT NULL
);

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `rating` float NOT NULL,
  `details` text DEFAULT NULL,
  `user_IP_adress` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` int(10) NOT NULL DEFAULT 0 COMMENT '0:active, 1:block'
);

CREATE TABLE `register` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` int(10) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `status` int(10) NOT NULL DEFAULT 0 COMMENT '0:active, 1:bock'
);

CREATE TABLE `sales` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `rate` decimal(10,2) DEFAULT 0.00,
  `image` varchar(100) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
);