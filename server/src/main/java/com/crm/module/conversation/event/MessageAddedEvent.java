package com.crm.module.conversation.event;

import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.entity.Message;
import org.springframework.context.ApplicationEvent;

public class MessageAddedEvent extends ApplicationEvent {

    private final Conversation conversation;
    private final Message message;

    public MessageAddedEvent(Object source, Conversation conversation, Message message) {
        super(source);
        this.conversation = conversation;
        this.message = message;
    }

    public Conversation getConversation() {
        return conversation;
    }

    public Message getMessage() {
        return message;
    }
}
