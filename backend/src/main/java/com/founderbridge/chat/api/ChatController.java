package com.founderbridge.chat.api;

import com.founderbridge.auth.domain.*;
import com.founderbridge.chat.domain.*;
import com.founderbridge.chat.service.ChatService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.OffsetDateTime;
import java.util.*;

@Tag(name = "Chat")
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate broker;

    // ── REST: room history ────────────────────────────────────

    @GetMapping("/rooms")
    public List<RoomDto> myRooms(@AuthenticationPrincipal String userId) {
        return chatService.myRooms(UUID.fromString(userId));
    }

    @GetMapping("/rooms/{roomId}/messages")
    public Page<MessageDto> history(@AuthenticationPrincipal String userId,
                                     @PathVariable UUID roomId,
                                     @RequestParam(defaultValue = "0") int page) {
        chatService.assertMember(UUID.fromString(userId), roomId);
        return chatService.history(roomId, page).map(MessageDto::from);
    }

    @PostMapping("/rooms/direct/{targetUserId}")
    @ResponseStatus(HttpStatus.CREATED)
    public RoomDto openDirect(@AuthenticationPrincipal String userId,
                               @PathVariable UUID targetUserId) {
        return RoomDto.from(chatService.openDirectRoom(UUID.fromString(userId), targetUserId));
    }

    // ── STOMP: send message ──────────────────────────────────

    @MessageMapping("/chat.send/{roomId}")
    public void sendMessage(@DestinationVariable UUID roomId,
                             @Payload SendMessagePayload payload,
                             Principal principal) {
        UUID senderId = UUID.fromString(principal.getName());
        ChatMessage msg = chatService.sendMessage(senderId, roomId, payload.body());

        // Broadcast to all room subscribers
        broker.convertAndSend("/topic/room/" + roomId, MessageDto.from(msg));
    }

    @MessageMapping("/chat.read/{roomId}")
    public void markRead(@DestinationVariable UUID roomId, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        chatService.markRead(userId, roomId);
        broker.convertAndSend("/topic/room/" + roomId + "/read",
            Map.of("userId", userId, "roomId", roomId));
    }

    // ── DTOs ─────────────────────────────────────────────────

    public record MessageDto(UUID id, String roomId, String senderId,
                              String senderHandle, String body,
                              String status, String createdAt) {
        public static MessageDto from(ChatMessage m) {
            return new MessageDto(m.getId(), m.getRoom().getId().toString(),
                m.getSender().getId().toString(), m.getSender().getUserHandle(),
                m.getBody(), m.getStatus().name(), m.getCreatedAt().toString());
        }
    }

    public record RoomDto(UUID id, String type, String name,
                           List<String> memberHandles, String createdAt) {
        public static RoomDto from(ChatRoom r) {
            return new RoomDto(r.getId(), r.getType().name(), r.getName(),
                List.of(), r.getCreatedAt().toString());
        }
    }

    public record SendMessagePayload(String body) {}
}
