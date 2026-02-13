<?php

declare(strict_types=1);

namespace Models;

use Core\Interfaces\DatabaseInterface;

class CategoryRepository
{
    public function __construct(
        private readonly DatabaseInterface $db
    ) {
    }

    public function getAll(): array
    {
        $stmt = $this->db->prepare("SELECT * FROM news_type ORDER BY news_type_id ASC");
        if (!$stmt || !$stmt->execute()) {
            return [];
        }
        return $this->db->fetchAll($stmt);
    }

    public function exists(int $id): bool
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM news_type WHERE news_type_id = :id");
        if (!$stmt) {
            return false;
        }
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        if (!$stmt->execute()) {
            return false;
        }
        $result = $this->db->fetchAssoc($stmt);
        return $result && (int) ($result['count'] ?? 0) > 0;
    }
}
