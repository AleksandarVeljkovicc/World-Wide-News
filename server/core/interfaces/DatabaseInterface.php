<?php

declare(strict_types=1);

namespace Core\Interfaces;

use PDOStatement;

interface DatabaseInterface
{
    public function connect(): bool;

    public function prepare(string $sql): ?PDOStatement;

    public function execute(PDOStatement $stmt, array $params = []): bool;

    public function fetchAssoc($result): ?array;

    public function fetchObject($result);

    public function fetchAll($result): array;

    public function numRows($result): int;

    public function insertId(): int;

    public function error(): string;

    public function beginTransaction(): bool;

    public function commit(): bool;

    public function rollBack(): bool;

    public function inTransaction(): bool;
}
