package com.founderbridge.chat.domain;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    Page<ChatMessage> findByRoomIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID roomId, Pageable page);
    @Modifying
    @Query("UPDATE ChatMessage m SET m.status = 'READ' WHERE m.room.id = :roomId AND m.sender.id != :userId AND m.status != 'READ'")
    int markRoomRead(UUID roomId, UUID userId);
}
