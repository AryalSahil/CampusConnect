# Firebase Security Specification for Campus Connect

## 1. Data Invariants
* **Users Collection (`/users/{userId}`)**:
  * A user profile can only be read or created/updated by the authenticated owner (`request.auth.uid == userId`).
  * No public directory listings or direct email access are allowed.
  * Fields like `uid` must match the auth context UID.
  * Timestamps like `createdAt` must match the server's request time.

* **Waitlist Collection (`/waitlist/{waitlistId}`)**:
  * A student can create their own waitlist spot. The `waitlistId` must match their authenticated uid (`request.auth.uid == waitlistId`).
  * Users can only read and write their own waitlist spot. No broad collection list/read is allowed.
  * Fields like `fullName` and `email` must be valid strings and not empty.
  * Timestamps like `joinedAt` must be set to `request.time`.

---

## 2. The "Dirty Dozen" Malicious Payloads (TDD Test Suite)

Here are 12 malicious payloads designed to attempt parameter pollution, shadow updates, identity theft, and spam attacks. Our rules must explicitly reject all of these.

### Payload 1: Spying on others (Anonymous/Unauthenticated direct read of waitlist)
* **Goal**: Read another user's waitlist registration.
* **Payload**: `get(/databases/$(database)/documents/waitlist/attacker_uid)` without auth headers.
* **Target Outcome**: `PERMISSION_DENIED`

### Payload 2: Self-verification spoofing (Setting own role or verification flags)
* **Goal**: Write a user document in `/users/hacker_uid` with unauthorized elevated permissions (`isAdmin: true`).
* **Payload**: `{"uid": "hacker_uid", "email": "attacker@gmail.com", "displayName": "Attacker", "isAdmin": true, "createdAt": "request.time"}`
* **Target Outcome**: `PERMISSION_DENIED`

### Payload 3: Impersonation of other student
* **Goal**: Create/update waitlist position for a victim's uid `victim_student_123` from attacker's authenticated uid `attacker_uid`.
* **Payload**: `{"uid": "victim_student_123", "fullName": "Victim Name", "email": "victim@edu.com", "collegeName": "Stanford", "course": "CS", "graduationYear": "2027", "joinedAt": "request.time"}`
* **Target Outcome**: `PERMISSION_DENIED`

### Payload 4: Arbitrary ID string pollution
* **Goal**: Abuse document path by writing a 10KB junk-character document ID.
* **Path**: `/waitlist/SOME_VERY_LONG_STRING_REPEATED_TEN_THOUSAND_TIMES`
* **Target Outcome**: `PERMISSION_DENIED`

### Payload 5: Spoofing the waitlist signup time
* **Goal**: Manually supply a past or future timestamp as `joinedAt` to bypass the waitlist queue fairly.
* **Payload**: `{"uid": "attacker_uid", "fullName": "Attacker Major", "email": "attacker@college.edu", "collegeName": "MIT", "course": "Maths", "graduationYear": "2026", "joinedAt": "2020-01-01T00:00:00Z"}` (instead of server timestamp)
* **Target Outcome**: `PERMISSION_DENIED`

### Payload 6: Field Injection Shadow Update
* **Goal**: Update and sneak in shadow fields such as `isWaitlistBypassed: true`.
* **Payload**: `{"fullName": "Updated Student", "isWaitlistBypassed": true}`
* **Target Outcome**: `PERMISSION_DENIED` (hasOnly constraint blocks unexpected keys)

### Payload 7: email_verified Identity Spoofing
* **Goal**: Access waitlist data or profile using an unverified student email string to trigger student-only access.
* **Payload**: `request.auth.token.email_verified == false` but requesting student access.
* **Target Outcome**: `PERMISSION_DENIED`

### Payload 8: Corrupting Data Types
* **Goal**: Write a non-string or ultra-large object into the `collegeName` field.
* **Payload**: `{"collegeName": {"nested_key": 999999}}`
* **Target Outcome**: `PERMISSION_DENIED`

### Payload 9: Denial of Wallet via massive string fields
* **Goal**: Save a waitlist profile with a 1MB study description/major text inside `course` to deplete Firestore storage quotas.
* **Payload**: `{"course": "LARGE_STRING_OVER_1MB"}`
* **Target Outcome**: `PERMISSION_DENIED`

### Payload 10: Mutating Immutable fields after creation
* **Goal**: Change the `joinedAt` or `email` after waitlist sign-up has completed.
* **Payload**: Updating `joinedAt` on pre-existing document.
* **Target Outcome**: `PERMISSION_DENIED`

### Payload 11: Bulk scraping/listing of waitlist entries
* **Goal**: List all entries from `/waitlist` to scrape student emails of other colleges.
* **Payload**: `getDocs(collection(db, "waitlist"))`
* **Target Outcome**: `PERMISSION_DENIED`

### Payload 12: Hijacking referrals count
* **Goal**: Directly write into another user's profile to manipulate referred numbers without proper registration.
* **Payload**: Updating a different user's document directly.
* **Target Outcome**: `PERMISSION_DENIED`

---

## 3. Test Runner Schema
The `firestore.rules.test.ts` will verify these using `@firebase/rules-unit-testing` or similar, ensuring every single write triggers schema validation constraints.
