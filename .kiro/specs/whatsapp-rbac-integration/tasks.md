# RBAC Integration - Implementation Tasks

**Module**: Role-Based Access Control  
**Status**: Ready for Implementation  
**Date**: 2026-04-09

---

## Task Breakdown

### Phase 1: Backend Infrastructure

#### Task 1.1: Create Roles Table (Flyway Migration)
- **File**: `server/src/main/resources/db/migration/V16__create_roles_table.sql`
- **Checklist**:
  - [x] Create `roles` table with all required columns
  - [x] Add unique constraint (workspace_id, name)
  - [x] Add foreign key to workspaces
  - [x] Create indexes on workspace_id, is_system, is_active
  - [ ] Verify migration runs on app startup
- **Status**: ✅ COMPLETED

#### Task 1.2: Create Role Entity & Repository
- **Files**:
  - `server/src/main/java/com/crm/module/user/entity/Role.java`
  - `server/src/main/java/com/crm/module/user/repository/RoleRepository.java`
- **Checklist**:
  - [x] Create Role entity with all fields
  - [x] Create RoleRepository with custom queries
  - [x] Add @Entity, @Table annotations
  - [x] Extend AuditableEntity
  - [ ] Write tests for repository
- **Status**: ✅ COMPLETED

#### Task 1.3: Create RoleService (CRUD & Initialization)
- **File**: `server/src/main/java/com/crm/module/user/service/RoleService.java`
- **Checklist**:
  - [x] Implement `initializeSystemRoles(workspaceId)`
  - [x] Create ADMIN, AGENT, USER, VIEWER with correct permissions
  - [x] Make idempotent (no duplicate on multiple calls)
  - [x] Implement CRUD methods
  - [ ] Add transaction handling
  - [ ] Write unit tests
- **Status**: ✅ COMPLETED

#### Task 1.4: Create RoleController (REST API)
- **File**: `server/src/main/java/com/crm/module/user/controller/RoleController.java`
- **Checklist**:
  - [x] Create GET /api/roles (list)
  - [x] Create GET /api/roles/:id (get)
  - [x] Create POST /api/roles (create custom)
  - [x] Create PUT /api/roles/:id (update)
  - [x] Create DELETE /api/roles/:id (delete custom)
  - [x] Add @PreAuthorize ADMIN guards on all endpoints
  - [ ] Add OpenAPI/Swagger documentation
  - [ ] Write integration tests
- **Status**: ✅ COMPLETED

#### Task 1.5: Create RoleDTO & Request Classes
- **Files**:
  - `server/src/main/java/com/crm/module/user/dto/RoleDto.java`
  - `server/src/main/java/com/crm/module/user/dto/CreateRoleRequest.java`
  - `server/src/main/java/com/crm/module/user/dto/UpdateRolePermissionsRequest.java`
- **Checklist**:
  - [x] Create DTOs with all fields
  - [x] Add validation annotations (@NotNull, @NotBlank, etc.)
  - [x] Create request classes
  - [ ] Add Javadoc comments
- **Status**: ✅ COMPLETED

#### Task 1.6: Integrate RoleService into AuthService
- **File**: `server/src/main/java/com/crm/module/auth/service/AuthService.java`
- **Checklist**:
  - [x] Inject RoleService
  - [x] Call `roleService.initializeSystemRoles(workspaceId)` in register()
  - [x] Assign default role (USER) to new users
  - [ ] Add tests for role initialization
- **Status**: ✅ COMPLETED

#### Task 1.7: Add @PreAuthorize to WhatsAppController
- **File**: `server/src/main/java/com/crm/module/whatsapp/controller/WhatsAppController.java`
- **Checklist**:
  - [x] Add `@PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")` to send endpoint
  - [x] Add `@PreAuthorize("hasAnyRole(...)")` to read endpoints
  - [ ] Test with different roles
- **Status**: ✅ COMPLETED

#### Task 1.8: Verify Backend Startup
- **Checklist**:
  - [ ] Start application
  - [ ] Verify Flyway V16 migration runs
  - [ ] Check roles table created in DB
  - [ ] Register test user and verify roles created
  - [ ] Test RoleController endpoints with Postman
- **Status**: ⏳ PENDING (need to run app)

---

### Phase 2: Frontend TypeScript Setup

#### Task 2.1: Configure TypeScript & Build Tools
- **Files**:
  - `whatsapp-prueba/tsconfig.json`
  - `whatsapp-prueba/tsconfig.node.json`
  - `whatsapp-prueba/vite.config.js`
- **Checklist**:
  - [x] Setup TypeScript with path aliases (`@/*`)
  - [x] Configure Vite for React + TypeScript
  - [x] Setup module resolution
  - [ ] Verify builds without errors
- **Status**: ✅ COMPLETED

#### Task 2.2: Configure Tailwind & shadcn/ui
- **Files**:
  - `whatsapp-prueba/tailwind.config.js`
  - `whatsapp-prueba/components.json`
  - `whatsapp-prueba/src/utils/cn.ts`
- **Checklist**:
  - [x] Setup Tailwind 4 with custom theme
  - [x] Create `cn()` utility (clsx + twMerge)
  - [x] Configure shadcn/ui
  - [ ] Add custom components from shadcn
- **Status**: ✅ COMPLETED

#### Task 2.3: Create Core Types
- **File**: `whatsapp-prueba/src/types/index.ts`
- **Checklist**:
  - [x] Define RoleType and ROLES constant
  - [x] Define Contact, Message, Conversation types
  - [x] Define UserSession type
  - [x] Define API response types
  - [x] Add AGENT to ROLES
  - [ ] Add validation for types
- **Status**: ✅ COMPLETED

#### Task 2.4: Create Zustand Store
- **File**: `whatsapp-prueba/src/store/whatsappStore.ts`
- **Checklist**:
  - [x] Create WhatsAppStore interface
  - [x] Add session & role state
  - [x] Add contact panel state (showContactPanel, selectedContactId)
  - [x] Add persist middleware
  - [x] Create store with all getters/setters
  - [ ] Write tests for store
- **Status**: ✅ COMPLETED

---

### Phase 3: Frontend RBAC Components

#### Task 3.1: Create useRbac Hook
- **File**: `whatsapp-prueba/src/hooks/useRbac.ts`
- **Checklist**:
  - [x] Create permission matrix (ROLE_PERMISSIONS)
  - [x] Implement hasPermission(perm)
  - [x] Implement hasAnyPermission(perms)
  - [x] Implement hasAllPermissions(perms)
  - [x] Implement hasRole(role)
  - [x] Add convenience methods (canSend, canViewConfig, etc.)
  - [ ] Write tests for all permission checks
  - [ ] Document with JSDoc
- **Status**: ✅ COMPLETED

#### Task 3.2: Create ContactInfoPanel Component
- **File**: `whatsapp-prueba/src/components/panels/ContactInfoPanel.tsx`
- **Checklist**:
  - [x] Create component with TypeScript types
  - [x] Implement view mode (read-only display)
  - [x] Implement edit mode (form with inputs)
  - [x] Add RBAC guard (only ADMIN/AGENT)
  - [x] Add close button
  - [x] Style with Tailwind
  - [ ] Implement PUT /api/contacts/:id integration
  - [ ] Add success/error toast messages
  - [ ] Write component tests
- **Status**: ✅ COMPLETED (view/edit modes), ⏳ PENDING (API integration)

#### Task 3.3: Integrate ContactInfoPanel into ConversationsPanel
- **File**: `whatsapp-prueba/src/components/panels/ConversationsPanel.jsx`
- **Checklist**:
  - [x] Import ContactInfoPanel
  - [x] Add state for contact panel (showContactPanel, selectedContact)
  - [x] Make contact name clickable
  - [x] Pass contact data to ContactInfoPanel
  - [x] Render ContactInfoPanel at end of component
  - [ ] Test opening/closing panel
  - [ ] Test that panel opens only on contact name click
- **Status**: ✅ COMPLETED

#### Task 3.4: Create App.tsx with Role Detection & Guards
- **File**: `whatsapp-prueba/src/App.tsx`
- **Checklist**:
  - [x] Create useDetectRole() hook
  - [x] Implement role detection from localStorage
  - [x] Call useWhatsAppStore().setSession()
  - [x] Create getAllowedTabs(role) function
  - [x] Create TabGuard component
  - [x] Create PermissionDenied component
  - [x] Export AppWithRoles main component
  - [ ] Test role detection
  - [ ] Test tab visibility by role
  - [ ] Test permission denied screen
- **Status**: ✅ COMPLETED

#### Task 3.5: Update Main Entry Point
- **File**: `whatsapp-prueba/src/main.tsx`
- **Checklist**:
  - [x] Create or update main.tsx
  - [x] Import AppWithRoles
  - [x] Mount with React.StrictMode
  - [x] Configure root element
- **Status**: ✅ COMPLETED

---

### Phase 4: Integration & Testing

#### Task 4.1: Backend Integration Tests
- **Checklist**:
  - [ ] Test role initialization on first register
  - [ ] Test send endpoint with ADMIN (should succeed)
  - [ ] Test send endpoint with AGENT (should succeed)
  - [ ] Test send endpoint with USER (should fail 403)
  - [ ] Test RoleController endpoints (CRUD)
  - [ ] Test permission strings are parsed correctly
- **Status**: ⏳ PENDING

#### Task 4.2: Frontend Unit Tests
- **Checklist**:
  - [ ] Test useRbac() with different roles
  - [ ] Test ContactInfoPanel renders only for ADMIN/AGENT
  - [ ] Test tab visibility matches role
  - [ ] Test store persistence/loading
- **Status**: ⏳ PENDING

#### Task 4.3: End-to-End Testing
- **Checklist**:
  - [ ] Register user → verify roles created
  - [ ] Login as ADMIN → all tabs visible
  - [ ] Login as AGENT → only send/templates/conversations visible
  - [ ] Login as USER → only conversations visible
  - [ ] Click contact name → ContactInfoPanel opens (ADMIN/AGENT)
  - [ ] Click contact name → panel doesn't open (USER)
  - [ ] Try to send message as USER → 403 error
- **Status**: ⏳ PENDING

#### Task 4.4: Verify Backend is Running
- **Checklist**:
  - [ ] Backend started from IDE
  - [ ] Flyway V16 migration executed
  - [ ] roles table exists in PostgreSQL
  - [ ] No errors in logs
- **Status**: ⏳ PENDING (waiting for user)

---

### Phase 5: Documentation & Commit

#### Task 5.1: Document in Engram Memory
- **Checklist**:
  - [ ] Save SDD files to Engram (mem_save)
  - [ ] Save key decisions as observations
  - [ ] Save implementation notes
  - [ ] Create session summary
- **Status**: ⏳ PENDING

#### Task 5.2: Commit to Git
- **Commits needed**:
  1. `docs(sdd): add RBAC specification and design`
  2. `feat(backend): create roles table and RoleService`
  3. `feat(frontend): add useRbac hook and ContactInfoPanel`
  4. `feat(frontend): integrate RBAC guards in App.tsx`
- **Checklist**:
  - [ ] Each commit follows Conventional Commits
  - [ ] Each commit has clear scope (backend/frontend)
  - [ ] Each commit is logically grouped
- **Status**: ⏳ PENDING

#### Task 5.3: Create PR
- **Checklist**:
  - [ ] Create PR from `feat/startup-crm/whatsapp` → `dev`
  - [ ] Add description linking to SDD
  - [ ] Request review
  - [ ] Merge after approval
- **Status**: ⏳ PENDING

---

## Dependency Graph

```
Task 1.1 (Migration) ──────┐
Task 1.2 (Entity) ────────┬┴─── Task 1.3 (RoleService) ──┬
Task 1.5 (DTOs) ──────────┘                               ├─── Task 1.4 (Controller)
Task 1.6 (AuthService) ──────────────────────────────────┘
Task 1.7 (WhatsAppController) ─ (depends on 1.3)
Task 1.8 (Verify) ─ (depends on 1.1 + 1.3 + 1.4)

Task 2.1 (TypeScript Config) ┐
Task 2.2 (Tailwind Config) ─┬┴─── Task 2.3 (Types) ─┬
                            └──── Task 2.4 (Store) ─┼─── Task 3.1 (useRbac)
                                                     ├─── Task 3.2 (ContactInfoPanel)
                                                     └─── Task 3.4 (App.tsx)

Task 3.2 (ContactInfoPanel) ──── Task 3.3 (ConversationsPanel Integration)
Task 3.1 (useRbac) ────────────── Task 3.4 (App.tsx Guards)
Task 3.5 (main.tsx) ────────────── (depends on 3.4)

All Phase 1-3 ────────── Task 4.1+ (Testing & Integration)
All Phases ────────────── Task 5.1+ (Documentation & Commit)
```

---

## Priority & Effort Estimation

| Task | Priority | Effort | Status |
|------|----------|--------|--------|
| 1.1 - Roles Migration | 🔴 CRITICAL | 30 min | ✅ DONE |
| 1.2 - Role Entity | 🔴 CRITICAL | 20 min | ✅ DONE |
| 1.3 - RoleService | 🔴 CRITICAL | 45 min | ✅ DONE |
| 1.4 - RoleController | 🟡 HIGH | 40 min | ✅ DONE |
| 1.5 - DTOs | 🟡 HIGH | 15 min | ✅ DONE |
| 1.6 - AuthService Integration | 🟡 HIGH | 20 min | ✅ DONE |
| 1.7 - @PreAuthorize | 🟡 HIGH | 15 min | ✅ DONE |
| 1.8 - Backend Verification | 🔴 CRITICAL | 30 min | ⏳ PENDING |
| 2.1 - TypeScript Config | 🟢 MEDIUM | 25 min | ✅ DONE |
| 2.2 - Tailwind Config | 🟢 MEDIUM | 20 min | ✅ DONE |
| 2.3 - Types | 🟢 MEDIUM | 30 min | ✅ DONE |
| 2.4 - Store | 🟢 MEDIUM | 35 min | ✅ DONE |
| 3.1 - useRbac | 🟡 HIGH | 40 min | ✅ DONE |
| 3.2 - ContactInfoPanel | 🟡 HIGH | 45 min | ✅ DONE |
| 3.3 - Integration | 🟡 HIGH | 30 min | ✅ DONE |
| 3.4 - App.tsx | 🟡 HIGH | 50 min | ✅ DONE |
| 3.5 - main.tsx | 🟢 MEDIUM | 10 min | ✅ DONE |
| 4.1+ - Testing | 🟡 HIGH | 2 hours | ⏳ PENDING |
| 5.1+ - Documentation | 🟡 HIGH | 1 hour | ⏳ PENDING |

**Total Completed**: ~7.5 hours  
**Total Remaining**: ~3.5 hours

---

## Success Criteria

- [x] SDD specification created (requirements.md + design.md + tasks.md)
- [x] Backend roles table created (V16 migration)
- [x] RoleService implemented with system role initialization
- [x] RoleController CRUD endpoints created
- [x] AuthService integrated with RoleService
- [x] WhatsAppController protected with @PreAuthorize
- [x] Frontend types and Zustand store configured
- [x] useRbac hook implemented
- [x] ContactInfoPanel component created
- [x] ContactInfoPanel integrated into ConversationsPanel
- [x] App.tsx with role detection and tab guards
- [ ] Backend verification (V16 runs, roles created in DB)
- [ ] Integration tests pass
- [ ] E2E testing successful
- [ ] All code committed with Conventional Commits
- [ ] SDD and code saved to Engram

---
