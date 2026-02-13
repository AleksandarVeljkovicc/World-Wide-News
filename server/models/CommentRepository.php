<?php

declare(strict_types=1);

namespace Models;

use Core\Interfaces\DatabaseInterface;

class CommentRepository
{
    public function __construct(
        private readonly DatabaseInterface $db
    ) {
    }

    public function getByNewsId(int $newsId): array
    {
        $stmt = $this->db->prepare(
            "SELECT cv.*, c.user_id FROM commentview cv 
             INNER JOIN comments c ON cv.comments_id = c.comments_id 
             WHERE cv.news_id = :news_id AND cv.allowed = 1 
             ORDER BY cv.date DESC"
        );
        if (!$stmt) {
            return [];
        }
        $stmt->bindValue(':news_id', $newsId, \PDO::PARAM_INT);
        if (!$stmt->execute()) {
            return [];
        }
        return $this->db->fetchAll($stmt);
    }

    public function create(int $userId, int $newsId, string $comment): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO comments (user_id, news_id, comment) VALUES (:user_id, :news_id, :comment)"
        );
        if (!$stmt) {
            return 0;
        }

        // Bind parameters with proper types
        $stmt->bindValue(':user_id', $userId, \PDO::PARAM_INT);
        $stmt->bindValue(':news_id', $newsId, \PDO::PARAM_INT);
        $stmt->bindValue(':comment', $comment, \PDO::PARAM_STR);

        if (!$stmt->execute()) {
            return 0;
        }
        return $this->db->insertId();
    }

    public function softDelete(int $commentId): bool
    {
        $stmt = $this->db->prepare("UPDATE comments SET allowed = 0 WHERE comments_id = :id");
        if (!$stmt) {
            return false;
        }
        $stmt->bindValue(':id', $commentId, \PDO::PARAM_INT);
        if (!$stmt->execute()) {
            return false;
        }
        return $this->db->error() === '';
    }

    public function getCommentAuthor(int $commentId): ?int
    {
        $stmt = $this->db->prepare("SELECT user_id FROM comments WHERE comments_id = :id");
        if (!$stmt) {
            return null;
        }
        $stmt->bindValue(':id', $commentId, \PDO::PARAM_INT);
        if (!$stmt->execute()) {
            return null;
        }
        $row = $this->db->fetchAssoc($stmt);
        return $row ? (int) ($row['user_id'] ?? 0) : null;
    }
}
