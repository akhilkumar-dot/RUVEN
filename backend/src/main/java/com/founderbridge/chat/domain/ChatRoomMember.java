package com.founderbridge.chat.domain;
import com.founderbridge.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;
@Entity @Table(name = "chat_room_members")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@IdClass(ChatRoomMember.PK.class)
public class ChatRoomMember {
    @Id @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "room_id") private ChatRoom room;
    @Id @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    @Column(name = "joined_at") @Builder.Default private OffsetDateTime joinedAt = OffsetDateTime.now();
    @lombok.Data public static class PK implements Serializable {
        private UUID room; private UUID user;
    }
}
