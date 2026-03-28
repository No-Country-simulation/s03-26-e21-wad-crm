package com.crm.module.company.service;

import com.crm.common.exception.ResourceNotFoundException;
import com.crm.common.security.WorkspaceContext;
import com.crm.module.company.dto.CompanyRequest;
import com.crm.module.company.dto.CompanyResponse;
import com.crm.module.company.entity.Company;
import com.crm.module.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;

    @Transactional
    public CompanyResponse create(CompanyRequest request) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();

        Company company = Company.builder()
                .name(request.name())
                .domain(request.domain())
                .industry(request.industry())
                .build();
        company.setWorkspaceId(workspaceId);

        return toResponse(companyRepository.save(company));
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> findAll() {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        return companyRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyResponse findById(UUID id) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        Company company = companyRepository.findByWorkspaceIdAndId(workspaceId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", id));
        return toResponse(company);
    }

    @Transactional
    public CompanyResponse update(UUID id, CompanyRequest request) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();

        Company company = companyRepository.findByWorkspaceIdAndId(workspaceId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", id));

        if (request.name() != null) company.setName(request.name());
        if (request.domain() != null) company.setDomain(request.domain());
        if (request.industry() != null) company.setIndustry(request.industry());

        return toResponse(companyRepository.save(company));
    }

    private CompanyResponse toResponse(Company c) {
        return new CompanyResponse(
                c.getId(),
                c.getName(),
                c.getDomain(),
                c.getIndustry(),
                c.getWorkspaceId(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
