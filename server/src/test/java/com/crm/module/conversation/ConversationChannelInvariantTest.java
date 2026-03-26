package com.crm.module.conversation;

import com.crm.module.conversation.dto.AddMessageRequest;
import com.crm.module.conversation.entity.*;
import com.crm.module.conversation.repository.ConversationRepository;
import com.crm.module.conversation.repository.MessageRepository;
import com.crm.module.conversation.service.ConversationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Propiedad 11: canal del mensaje siempre coincide con canal de la conversación padre.
 *
 * Para todo mensaje M y su conversación padre C: M.channel == C.channel
 * Se verifica para todos los valores de MessageChannel (WHATSAPP, EMAIL)
 * y todas las direcciones (INBOUND, OUTBOUND).
 *
 * Validates: Requisitos 20.4, 25.2
 */
@ExtendWith(MockitoExtension.class)
class ConversationChannelInvariantTest {

    @Mock ConversationRepository conversationRepository;
    @Mock MessageRepository messageRepository;
    @Mock SimpMessagingTemplate messagingTemplate;

    @InjectMocks ConversationService conversationService;

    private UUID workspaceId;
    private UUID contactId;

    @BeforeEach
    void setUp() {
        workspaceId = UUID.randomUUID();
        contactId = UUID.randomUUID();
    }

    // ── Generators ────────────────────────────────────────────────────────────

    /**
     * Genera todas las combinaciones de (channel, direction) para cubrir el espacio
     * de entrada completo de la propiedad.
     */
    static Stream<Arguments> allChannelDirectionCombinations() {
        return Stream.of(MessageChannel.values())
                .flatMap(channel -> Stream.of(MessageDirection.values())
                        .map(direction -> Arguments.of(channel, direction)));
    }

    /**
     * Genera combinaciones donde el canal del request NO coincide con el de la conversación.
     * Sirve para verificar el comportamiento ante entradas inválidas.
     */
    static Stream<Arguments> mismatchedChannelCombinations() {
        return Stream.of(
                Arguments.of(MessageChannel.WHATSAPP, MessageChannel.EMAIL, MessageDirection.INBOUND),
                Arguments.of(MessageChannel.WHATSAPP, MessageChannel.EMAIL, MessageDirection.OUTBOUND),
                Arguments.of(MessageChannel.EMAIL, MessageChannel.WHATSAPP, MessageDirection.INBOUND),
                Arguments.of(MessageChannel.EMAIL, MessageChannel.WHATSAPP, MessageDirection.OUTBOUND)
        );
    }

    // ── Propiedad 11: invariante de canal ─────────────────────────────────────

    /**
     * Propiedad 11 — caso nominal:
     * Cuando el canal del request coincide con el canal de la conversación,
     * el mensaje persistido hereda exactamente ese canal.
     *
     * Validates: Requisito 20.4, 25.2
     */
    @ParameterizedTest(name = "channel={0}, direction={1}")
    @MethodSource("allChannelDirectionCombinations")
    @DisplayName("Propiedad 11: mensaje guardado hereda el canal de la conversación padre")
    void property11_messageSavedWithConversationChannel(
            MessageChannel channel, MessageDirection direction) {

        // Arrange
        Conversation conversation = buildConversation(channel);
        AddMessageRequest request = new AddMessageRequest(
                conversation.getId(),
                "Hola mundo",
                direction,
                channel,          // canal coincide con la conversación
                MessageStatus.SENT,
                null,
                LocalDateTime.now()
        );

        when(conversationRepository.findByIdAndWorkspaceId(conversation.getId(), workspaceId))
                .thenReturn(Optional.of(conversation));

        ArgumentCaptor<Message> messageCaptor = ArgumentCaptor.forClass(Message.class);
        when(messageRepository.save(messageCaptor.capture())).thenAnswer(inv -> inv.getArgument(0));
        when(conversationRepository.save(any())).thenReturn(conversation);
        doNothing().when(messagingTemplate).convertAndSend(anyString(), any(Object.class));

        // Act
        conversationService.addMessage(request, workspaceId);

        // Assert — Propiedad 11: M.channel == C.channel
        Message savedMessage = messageCaptor.getValue();
        assertThat(savedMessage.getChannel())
                .as("El canal del mensaje debe coincidir con el canal de la conversación padre")
                .isEqualTo(conversation.getChannel());
    }

    /**
     * Propiedad 11 — corolario de identidad:
     * El canal del mensaje retornado en el DTO también debe coincidir con el de la conversación.
     *
     * Validates: Requisito 20.4, 25.2
     */
    @ParameterizedTest(name = "channel={0}, direction={1}")
    @MethodSource("allChannelDirectionCombinations")
    @DisplayName("Propiedad 11: DTO retornado refleja el canal de la conversación padre")
    void property11_returnedDtoReflectsConversationChannel(
            MessageChannel channel, MessageDirection direction) {

        // Arrange
        Conversation conversation = buildConversation(channel);
        AddMessageRequest request = new AddMessageRequest(
                conversation.getId(),
                "Test body",
                direction,
                channel,
                null,
                "ext-" + UUID.randomUUID(),
                LocalDateTime.now()
        );

        when(conversationRepository.findByIdAndWorkspaceId(conversation.getId(), workspaceId))
                .thenReturn(Optional.of(conversation));
        when(messageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(conversationRepository.save(any())).thenReturn(conversation);
        doNothing().when(messagingTemplate).convertAndSend(anyString(), any(Object.class));

        // Act
        var dto = conversationService.addMessage(request, workspaceId);

        // Assert — el DTO también debe reflejar el canal correcto
        assertThat(dto.channel())
                .as("El DTO del mensaje debe reflejar el canal de la conversación padre")
                .isEqualTo(conversation.getChannel());
    }

    /**
     * Propiedad 11 — invariante de canal en findOrCreate:
     * La conversación creada por findOrCreate siempre tiene el canal solicitado,
     * garantizando que el canal queda fijado desde la creación.
     *
     * Validates: Requisito 20.4
     */
    @ParameterizedTest(name = "channel={0}")
    @MethodSource("com.crm.module.conversation.ConversationChannelInvariantTest#allChannels")
    @DisplayName("Propiedad 11: findOrCreate fija el canal de la conversación correctamente")
    void property11_findOrCreateFixesChannelOnConversation(MessageChannel channel) {

        // Arrange — no existe conversación previa
        when(conversationRepository.findByWorkspaceIdAndContactIdAndChannel(
                workspaceId, contactId, channel))
                .thenReturn(Optional.empty());

        ArgumentCaptor<Conversation> convCaptor = ArgumentCaptor.forClass(Conversation.class);
        when(conversationRepository.save(convCaptor.capture()))
                .thenAnswer(inv -> inv.getArgument(0));

        // Act
        Conversation result = conversationService.findOrCreate(contactId, channel, workspaceId);

        // Assert — la conversación creada tiene el canal correcto
        assertThat(result.getChannel())
                .as("findOrCreate debe fijar el canal solicitado en la conversación")
                .isEqualTo(channel);
        assertThat(convCaptor.getValue().getChannel())
                .as("La conversación persistida debe tener el canal correcto")
                .isEqualTo(channel);
    }

    /**
     * Propiedad 11 — canal mismatched:
     * Cuando el request envía un canal diferente al de la conversación padre,
     * el servicio debe rechazar la operación con IllegalArgumentException.
     * En ningún caso debe persistir un mensaje con canal diferente al de su conversación.
     *
     * Validates: Requisito 20.4, 25.2
     */
    @ParameterizedTest(name = "conversationChannel={0}, requestChannel={1}, direction={2}")
    @MethodSource("mismatchedChannelCombinations")
    @DisplayName("Propiedad 11: canal mismatched — servicio rechaza mensaje con canal diferente al de la conversación")
    void property11_mismatchedChannel_messageNeverPersistedWithWrongChannel(
            MessageChannel conversationChannel,
            MessageChannel requestChannel,
            MessageDirection direction) {

        // Arrange
        Conversation conversation = buildConversation(conversationChannel);
        AddMessageRequest request = new AddMessageRequest(
                conversation.getId(),
                "Mensaje con canal incorrecto",
                direction,
                requestChannel,   // canal DIFERENTE al de la conversación
                MessageStatus.SENT,
                null,
                LocalDateTime.now()
        );

        when(conversationRepository.findByIdAndWorkspaceId(conversation.getId(), workspaceId))
                .thenReturn(Optional.of(conversation));

        // Assert — el servicio debe lanzar excepción ante canal incorrecto
        // garantizando que nunca se persiste un mensaje con canal diferente al de su conversación
        org.assertj.core.api.Assertions.assertThatThrownBy(
                () -> conversationService.addMessage(request, workspaceId))
                .as("El servicio debe rechazar mensajes con canal diferente al de la conversación. "
                        + "conversationChannel=%s, requestChannel=%s", conversationChannel, requestChannel)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining(conversationChannel.name())
                .hasMessageContaining(requestChannel.name());

        // Verificar que nunca se intentó persistir el mensaje
        verify(messageRepository, never()).save(any());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    static Stream<Arguments> allChannels() {
        return Stream.of(MessageChannel.values()).map(Arguments::of);
    }

    private Conversation buildConversation(MessageChannel channel) {
        Conversation conv = new Conversation();
        UUID convId = UUID.randomUUID();
        // Setear id via reflection (AuditableEntity usa @GeneratedValue)
        try {
            var idField = com.crm.common.audit.AuditableEntity.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(conv, convId);
            var widField = com.crm.common.audit.AuditableEntity.class.getDeclaredField("workspaceId");
            widField.setAccessible(true);
            widField.set(conv, workspaceId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        conv.setContactId(contactId);
        conv.setChannel(channel);
        conv.setStatus(ConversationStatus.OPEN);
        return conv;
    }
}
