<?php

declare(strict_types=1);

namespace Models;

use Core\Interfaces\DatabaseInterface;

class NewsRepository
{
    public function __construct(
        private readonly DatabaseInterface $db
    ) {
    }

    public function getLatestByCategory(?string $category = null): array
    {
        if ($category) {
            $stmt = $this->db->prepare(
                "SELECT * FROM newsview WHERE type = :category AND deleted = 0 ORDER BY news_id DESC"
            );
            if (!$stmt) {
                return [];
            }
            $stmt->bindValue(':category', $category, \PDO::PARAM_STR);
            if (!$stmt->execute()) {
                return [];
            }
        } else {
            $stmt = $this->db->prepare(
                "SELECT * FROM newsview WHERE news_id IN (SELECT max(news_id) FROM newsview WHERE deleted=0 GROUP BY type) ORDER BY news_id DESC"
            );
            if (!$stmt || !$stmt->execute()) {
                return [];
            }
        }
        return $this->db->fetchAll($stmt);
    }

    public function getById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM newsview WHERE deleted = 0 AND news_id = :id");
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

    public function incrementViews(int $id): void
    {
        $stmt = $this->db->prepare("UPDATE news SET views = views + 1 WHERE news_id = :id");
        if ($stmt) {
            $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();
        }
    }

    public function search(string $search): array
    {
        $stmt = $this->db->prepare("SELECT * FROM newsview WHERE headline LIKE :search AND deleted = 0 ORDER BY news_id DESC");
        if (!$stmt) {
            return [];
        }
        $stmt->bindValue(':search', "%{$search}%", \PDO::PARAM_STR);
        if (!$stmt->execute()) {
            return [];
        }
        return $this->db->fetchAll($stmt);
    }

    public function getAllForAdmin(): array
    {
        $stmt = $this->db->prepare("SELECT * FROM newsview WHERE deleted = 0 ORDER BY news_id DESC");
        if (!$stmt || !$stmt->execute()) {
            return [];
        }
        return $this->db->fetchAll($stmt);
    }

    public function getMostPopularThisMonth(): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM newsview WHERE deleted = 0 AND DATEDIFF(NOW(),published) < 30 " .
            "GROUP BY news_id HAVING MAX(views) ORDER BY views DESC LIMIT 1"
        );
        if (!$stmt || !$stmt->execute()) {
            return null;
        }
        $result = $this->db->fetchAssoc($stmt);
        return $result ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO news (headline, text, news_type_id, image, author) " .
            "VALUES (:headline, :text, :news_type_id, :image, :author)"
        );
        if (!$stmt) {
            return 0;
        }

        // Bind parameters with proper types
        $stmt->bindValue(':headline', $data['headline'], \PDO::PARAM_STR);
        $stmt->bindValue(':text', $data['text'], \PDO::PARAM_STR);
        $stmt->bindValue(':news_type_id', (int) $data['news_type_id'], \PDO::PARAM_INT);
        $stmt->bindValue(':image', $data['image'], \PDO::PARAM_LOB);
        $stmt->bindValue(':author', (int) $data['author'], \PDO::PARAM_INT);

        if (!$stmt->execute()) {
            return 0;
        }
        return $this->db->insertId();
    }

    public function softDelete(int $id): bool
    {
        $stmt = $this->db->prepare("UPDATE news SET deleted = 1 WHERE news_id = :id");
        if (!$stmt) {
            return false;
        }
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        if (!$stmt->execute()) {
            return false;
        }
        return $this->db->error() === '';
    }
}
