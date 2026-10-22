package de.loopie.repository;

import de.loopie.entity.Transaction;
import de.loopie.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type")
    Integer sumAmountByUserIdAndType(@Param("userId") UUID userId, @Param("type") TransactionType type);
    @Query("SELECT COALESCE(SUM(t.value), 0) FROM Transaction t WHERE t.user.id = :userId")
    Long sumBalanceByUserId(@Param("userId") UUID userId);
    List<Transaction> findByUser_IdOrderByTimeStampDesc(UUID userId);
}