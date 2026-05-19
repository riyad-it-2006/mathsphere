# Firebase Security Specification - Math Community

## Data Invariants
- A message cannot exist without a valid chatRoom ID.
- A user can only edit their own profile.
- Only users with `role: "admin"` or `"teacher"` can create notices.
- Messages in batch-wise chat rooms are only readable by members of that batch.
- `createdAt` and `authorId` are immutable after creation.
- All IDs must be strictly validated for size and type.

## Dirty Dozen Payloads (Rejection Targets)
1. Creating a User profile for a different UID.
2. Updating a user's `role` from the client.
3. Sending a message anonymously.
4. Reading a private chat room where user isn't a member.
5. Deleting someone else's discussion post.
6. Injecting a 1MB string into a chat message `text`.
7. Creating a notice as a `student`.
8. Setting `createdAt` to a future date instead of `serverTimestamp()`.
9. Changing the `authorId` of a post after it's been created.
10. Creating a chatRoom with 10,000 members (limit should be 50 for performance).
11. Updating `isVerified` status of their own account.
12. Listing all users' private emails.

## RBAC Model
- **Student**: Read/Write discussions, join batch chats, view notices, view notes.
- **CR (Class Rep)**: Same as student + pin notices.
- **Teacher**: Same as CR + edit notices + upload official notes.
- **Admin**: Full access.
