<?php

declare(strict_types=1);

namespace Models;

use Core\Interfaces\DatabaseInterface;
use PDOStatement;

class UserRepository
{
    public function __construct(
        private readonly DatabaseInterface $db
    ) {
    }

    public function findByUsername(string $username): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM userview WHERE username = :username AND deleted = 0");
        if (!$stmt) {
            return null;
        }
        $stmt->bindValue(':username', $username, \PDO::PARAM_STR);
        if (!$stmt->execute()) {
            return null;
        }
        $result = $this->db->fetchAssoc($stmt);
        return $result ?: null;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM userview WHERE user_id = :id AND deleted = 0");
        if (!$stmt) {
            return null;
        }
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        if (!$stmt->execute()) {
            return null;
        }
        $result = $this->db->fetchAssoc($stmt);
        return $result ?: null;
    }

    public function usernameExists(string $username): bool
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM user WHERE username = :username");
        if (!$stmt) {
            return false;
        }
        $stmt->bindValue(':username', $username, \PDO::PARAM_STR);
        if (!$stmt->execute()) {
            return false;
        }
        $result = $this->db->fetchAssoc($stmt);
        return $result && (int) ($result['count'] ?? 0) > 0;
    }

    public function emailExists(string $email): bool
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM user WHERE email = :email");
        if (!$stmt) {
            return false;
        }
        $stmt->bindValue(':email', $email, \PDO::PARAM_STR);
        if (!$stmt->execute()) {
            return false;
        }
        $result = $this->db->fetchAssoc($stmt);
        return $result && (int) ($result['count'] ?? 0) > 0;
    }

    public function createUser(array $data): int
    {
        $cols = ['name', 'last_name', 'username', 'email', 'password', 'country', 'city'];
        $params = [];
        foreach ($cols as $col) {
            $params[$col] = $data[$col] ?? '';
        }

        if (!empty($data['date_of_birth'])) {
            $cols[] = 'date_of_birth';
            $params['date_of_birth'] = $data['date_of_birth'];
        }
        
        $hasImage = !empty($data['image']);
        if ($hasImage) {
            $cols[] = 'image';
        }

        $colList = implode(',', array_map(fn($c) => "`{$c}`", $cols));
        $placeholders = ':' . implode(', :', $cols);

        $sql = "INSERT INTO user ({$colList}) VALUES ({$placeholders})";
        $stmt = $this->db->prepare($sql);
        if (!$stmt) {
            return 0;
        }

        // Bind all parameters with proper types
        $stmt->bindValue(':name', $params['name'], \PDO::PARAM_STR);
        $stmt->bindValue(':last_name', $params['last_name'], \PDO::PARAM_STR);
        $stmt->bindValue(':username', $params['username'], \PDO::PARAM_STR);
        $stmt->bindValue(':email', $params['email'], \PDO::PARAM_STR);
        $stmt->bindValue(':password', $params['password'], \PDO::PARAM_STR);
        $stmt->bindValue(':country', $params['country'], \PDO::PARAM_STR);
        $stmt->bindValue(':city', $params['city'] ?? null, $params['city'] !== null ? \PDO::PARAM_STR : \PDO::PARAM_NULL);
        
        if (!empty($data['date_of_birth'])) {
            $stmt->bindValue(':date_of_birth', $params['date_of_birth'], \PDO::PARAM_STR);
        }

        // Bind image as LOB if present
        if ($hasImage) {
            $stmt->bindValue(':image', $data['image'], \PDO::PARAM_LOB);
        }

        // Execute without passing params array since we already bound them
        if (!$stmt->execute()) {
            return 0;
        }
        return $this->db->insertId();
    }
}
