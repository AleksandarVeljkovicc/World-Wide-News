<?php

declare(strict_types=1);

namespace Core;

use Core\Interfaces\DatabaseInterface;
use PDO;
use PDOException;
use PDOStatement;

class Database implements DatabaseInterface
{
    private ?PDO $connection = null;
    private ?PDOStatement $lastStatement = null;

    public function __construct(array $config)
    {
        try {
            $dsn = sprintf(
                'mysql:host=%s;dbname=%s;charset=%s',
                $config['host'],
                $config['database'],
                $config['charset'] ?? 'utf8mb4'
            );

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_STRINGIFY_FETCHES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . ($config['charset'] ?? 'utf8mb4')
            ];

            $this->connection = new PDO(
                $dsn,
                $config['username'],
                $config['password'],
                $options
            );
        } catch (PDOException $e) {
            $this->connection = null;
            error_log('Database connection failed: ' . $e->getMessage());
        }
    }

    public function connect(): bool
    {
        return $this->connection !== null;
    }

    public function prepare(string $sql): ?PDOStatement
    {
        if (!$this->connection) {
            return null;
        }

        try {
            return $this->connection->prepare($sql);
        } catch (PDOException $e) {
            error_log('PDO prepare failed: ' . $e->getMessage() . ' | SQL: ' . $sql);
            return null;
        }
    }

    public function execute(PDOStatement $stmt, array $params = []): bool
    {
        try {
            $this->lastStatement = $stmt;
            $result = $stmt->execute($params);
            if (!$result) {
                $errorInfo = $stmt->errorInfo();
                error_log('PDO execute failed: ' . ($errorInfo[2] ?? 'Unknown error'));
            }
            return $result;
        } catch (PDOException $e) {
            error_log('PDO execute exception: ' . $e->getMessage());
            return false;
        }
    }

    public function fetchAssoc($result): ?array
    {
        if ($result instanceof PDOStatement) {
            try {
                $row = $result->fetch(PDO::FETCH_ASSOC);
                return $row !== false ? $row : null;
            } catch (PDOException $e) {
                error_log('PDO fetchAssoc failed: ' . $e->getMessage());
                return null;
            }
        }
        return null;
    }

    public function fetchObject($result)
    {
        if ($result instanceof PDOStatement) {
            try {
                return $result->fetchObject();
            } catch (PDOException $e) {
                error_log('PDO fetchObject failed: ' . $e->getMessage());
                return null;
            }
        }
        return null;
    }

    public function fetchAll($result): array
    {
        if ($result instanceof PDOStatement) {
            try {
                return $result->fetchAll(PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                error_log('PDO fetchAll failed: ' . $e->getMessage());
                return [];
            }
        }
        return [];
    }

    public function numRows($result): int
    {
        if ($result instanceof PDOStatement) {
            try {
                return $result->rowCount();
            } catch (PDOException $e) {
                error_log('PDO numRows failed: ' . $e->getMessage());
                return 0;
            }
        }
        return 0;
    }

    public function insertId(): int
    {
        if (!$this->connection) {
            return 0;
        }
        try {
            return (int) $this->connection->lastInsertId();
        } catch (PDOException $e) {
            error_log('PDO insertId failed: ' . $e->getMessage());
            return 0;
        }
    }

    public function error(): string
    {
        if ($this->connection && $this->lastStatement) {
            $errorInfo = $this->lastStatement->errorInfo();
            return $errorInfo[2] ?? '';
        }
        if ($this->connection) {
            $errorInfo = $this->connection->errorInfo();
            return $errorInfo[2] ?? '';
        }
        return 'No connection';
    }

    public function beginTransaction(): bool
    {
        if (!$this->connection) {
            return false;
        }
        try {
            return $this->connection->beginTransaction();
        } catch (PDOException $e) {
            error_log('PDO beginTransaction failed: ' . $e->getMessage());
            return false;
        }
    }

    public function commit(): bool
    {
        if (!$this->connection) {
            return false;
        }
        try {
            return $this->connection->commit();
        } catch (PDOException $e) {
            error_log('PDO commit failed: ' . $e->getMessage());
            return false;
        }
    }

    public function rollBack(): bool
    {
        if (!$this->connection) {
            return false;
        }
        try {
            return $this->connection->rollBack();
        } catch (PDOException $e) {
            error_log('PDO rollBack failed: ' . $e->getMessage());
            return false;
        }
    }

    public function inTransaction(): bool
    {
        if (!$this->connection) {
            return false;
        }
        try {
            return $this->connection->inTransaction();
        } catch (PDOException $e) {
            return false;
        }
    }

    public function getConnection(): ?PDO
    {
        return $this->connection;
    }

    public function __destruct()
    {
        if ($this->connection && $this->connection->inTransaction()) {
            $this->connection->rollBack();
        }
        $this->connection = null;
        $this->lastStatement = null;
    }
}
