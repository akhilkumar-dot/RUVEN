package com.founderbridge.chat.domain;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {
    @Query("SELECT r FROM ChatRoom r JOIN ChatRoomMember m1 ON m1.room.id = r.id AND m1.user.id = :a JOIN ChatRoomMember m2 ON m2.room.id = r.id AND m2.user.id = :b WHERE r.type = 'DIRECT'")
    Optional<ChatRoom> findDirectRoom(UUID a, UUID b);
}
