package com.crm.module.contact.service;

import com.crm.common.exception.ResourceNotFoundException;
import com.crm.common.security.WorkspaceContext;
import com.crm.module.contact.dto.TagRequest;
import com.crm.module.contact.dto.TagResponse;
import com.crm.module.contact.entity.Tag;
import com.crm.module.contact.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Tag management scoped to the current workspace.
 *
 * Satisfies: Requirement 12.2
 */
@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    public List<TagResponse> listByWorkspace() {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        return tagRepository.findByWorkspaceId(workspaceId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TagResponse create(TagRequest request) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        Tag tag = Tag.builder()
                .name(request.name())
                .color(request.color())
                .build();
        tag.setWorkspaceId(workspaceId);
        return toResponse(tagRepository.save(tag));
    }

    @Transactional
    public void delete(UUID id) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        Tag tag = tagRepository.findByWorkspaceIdAndId(workspaceId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", id));
        tagRepository.delete(tag);
    }

    private TagResponse toResponse(Tag tag) {
        return new TagResponse(tag.getId(), tag.getName(), tag.getColor());
    }
}
