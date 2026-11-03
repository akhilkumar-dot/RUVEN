package com.founderbridge.chat.domain;
import com.founderbridge.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.OffsetDateTime;
import java.util.UUID;
@Entity @Table(name = "chat_messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessage {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "room_id") private ChatRoom room;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "sender_id") private User sender;
    @Column(columnDefinition = "TEXT", nullable = false) private String body;
    @Enumerated(EnumType.STRING) @Column(name = "msg_type", length = 20) @Builder.Default private MsgType msgType = MsgType.TEXT;
    @Enumerated(EnumType.STRING) @Column(length = 20) @Builder.Default private MsgStatus status = MsgStatus.SENT;
    @Column(name = "deleted_at") private OffsetDateTime deletedAt;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
    public enum MsgType   { TEXT, IMAGE, FILE, SYSTEM }
    public enum MsgStatus { SENT, DELIVERED, READ }
}
