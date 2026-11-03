package com.founderbridge.chat.domain;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, ChatRoomMember.PK> {
    @Query("SELECT m FROM ChatRoomMember m WHERE m.room.id = :roomId")
    List<ChatRoomMember> findByRoomId(UUID roomId);
    @Query("SELECT m.room.id FROM ChatRoomMember m WHERE m.user.id = :userId")
    List<UUID> findRoomIdsByUserId(UUID userId);
    boolean existsByRoomIdAndUserId(UUID roomId, UUID userId);
}
