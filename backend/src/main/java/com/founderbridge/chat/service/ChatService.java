package com.founderbridge.chat.service;

import com.founderbridge.auth.domain.*;
import com.founderbridge.chat.domain.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository       roomRepository;
    private final ChatRoomMemberRepository memberRepository;
    private final ChatMessageRepository    messageRepository;
    private final UserRepository           userRepository;

    public void assertMember(UUID userId, UUID roomId) {
        if (!memberRepository.existsByRoomIdAndUserId(roomId, userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a room member.");
    }

    public List<ChatController.RoomDto> myRooms(UUID userId) {
        List<UUID> roomIds = memberRepository.findRoomIdsByUserId(userId);
        return roomIds.stream()
            .map(roomRepository::findById)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .map(ChatController.RoomDto::from)
            .toList();
    }

    public Page<ChatMessage> history(UUID roomId, int page) {
        return messageRepository.findByRoomIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            roomId, PageRequest.of(page, 30));
    }

    @Transactional
    public ChatRoom openDirectRoom(UUID userId, UUID targetId) {
        return roomRepository.findDirectRoom(userId, targetId).orElseGet(() -> {
            ChatRoom room = roomRepository.save(ChatRoom.builder().type(ChatRoom.RoomType.DIRECT).build());
            User me = userRepository.findById(userId).orElseThrow();
            User them = userRepository.findById(targetId).orElseThrow();
            memberRepository.save(ChatRoomMember.builder().room(room).user(me).build());
            memberRepository.save(ChatRoomMember.builder().room(room).user(them).build());
            return room;
        });
    }

    @Transactional
    public ChatMessage sendMessage(UUID senderId, UUID roomId, String body) {
        assertMember(senderId, roomId);
        ChatRoom room = roomRepository.findById(roomId).orElseThrow();
        User sender = userRepository.findById(senderId).orElseThrow();
        return messageRepository.save(
            ChatMessage.builder().room(room).sender(sender).body(body).build());
    }

    @Transactional
    public void markRead(UUID userId, UUID roomId) {
        assertMember(userId, roomId);
        messageRepository.markRoomRead(roomId, userId);
    }
}
