// HENU MAIL - Contact Lists Store
// Organization: HENU OS Private Limited

import { Contact, ContactList } from "@/types";

declare global {
  // eslint-disable-next-line no-var
  var globalContactLists: Map<string, ContactList> | undefined;
  // eslint-disable-next-line no-var
  var globalContactRepo: Map<string, Contact> | undefined;
}

const INITIAL_CONTACTS: Contact[] = [
  {
    id: "cnt-1",
    workspaceId: "ws-1",
    email: "siddharthsingh4132@gmail.com",
    firstName: "Siddharth",
    lastName: "Singh",
    company: "HENU OS Client",
    jobTitle: "Founder & Director",
    phone: "+91 8094100513",
    tags: ["Verified Lead", "Digital Marketing", "VIP"],
    listIds: ["list-1"],
    customFields: { campaign: "Meta Ads 10-Day Pack" },
    status: "active",
    engagementScore: 98,
    softBounceCount: 0,
    createdAt: "2026-10-02T18:00:00.000Z",
    updatedAt: "2026-10-02T18:00:00.000Z",
  },
  {
    id: "cnt-2",
    workspaceId: "ws-1",
    email: "henuosr@gmail.com",
    firstName: "hso",
    lastName: "Team",
    company: "HENU OS Operations",
    jobTitle: "Product Lead",
    phone: "+91 8155077057",
    tags: ["Internal Ops", "Growth", "VIP"],
    listIds: ["list-1"],
    customFields: { campaign: "Meta Ads 10-Day Pack" },
    status: "active",
    engagementScore: 95,
    softBounceCount: 0,
    createdAt: "2026-10-02T18:00:00.000Z",
    updatedAt: "2026-10-02T18:00:00.000Z",
  },
];

const INITIAL_LISTS: ContactList[] = [
  {
    id: "list-1",
    workspaceId: "ws-1",
    name: "VIP Digital Marketing Recipients",
    description: "Verified direct outreach audience for Meta Ads 10-Day Growth Pack.",
    contactCount: 2,
    contactIds: ["cnt-1", "cnt-2"],
    updatedBy: "HENU OS PRIVATE LIMITED",
    createdAt: "2026-10-02T18:28:00.000Z",
    updatedAt: "2026-10-02T18:28:00.000Z",
  },
];

export function getListsStore(): Map<string, ContactList> {
  if (!globalThis.globalContactLists) {
    globalThis.globalContactLists = new Map();
    INITIAL_LISTS.forEach((list) => {
      globalThis.globalContactLists!.set(list.id, list);
    });
  }
  return globalThis.globalContactLists;
}

export function getContactsRepoStore(): Map<string, Contact> {
  if (!globalThis.globalContactRepo) {
    globalThis.globalContactRepo = new Map();
    INITIAL_CONTACTS.forEach((c) => {
      globalThis.globalContactRepo!.set(c.id, c);
    });
  }
  return globalThis.globalContactRepo;
}

export function getAllLists(): ContactList[] {
  const store = getListsStore();
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getListById(id: string): ContactList | undefined {
  return getListsStore().get(id);
}

export function createContactList(params: {
  name: string;
  description?: string;
  workspaceId?: string;
  updatedBy?: string;
}): ContactList {
  const store = getListsStore();
  const id = `list-${Date.now()}`;
  const now = new Date().toISOString();

  const newList: ContactList = {
    id,
    workspaceId: params.workspaceId || "ws-1",
    name: params.name.trim(),
    description: params.description?.trim() || "",
    contactCount: 0,
    contactIds: [],
    updatedBy: params.updatedBy || "HENU OS PRIVATE LIMITED",
    createdAt: now,
    updatedAt: now,
  };

  store.set(id, newList);
  return newList;
}

export function updateContactList(
  id: string,
  params: Partial<Omit<ContactList, "id" | "createdAt">>
): ContactList | null {
  const store = getListsStore();
  const existing = store.get(id);
  if (!existing) return null;

  const updated: ContactList = {
    ...existing,
    ...params,
    contactCount: params.contactIds ? params.contactIds.length : existing.contactCount,
    updatedAt: new Date().toISOString(),
  };

  store.set(id, updated);
  return updated;
}

export function deleteContactList(id: string): boolean {
  const store = getListsStore();
  return store.delete(id);
}

export function addContactsToList(listId: string, contactIds: string[]): ContactList | null {
  const store = getListsStore();
  const list = store.get(listId);
  if (!list) return null;

  const idSet = new Set(list.contactIds);
  contactIds.forEach((id) => idSet.add(id));

  const updatedIds = Array.from(idSet);
  list.contactIds = updatedIds;
  list.contactCount = updatedIds.length;
  list.updatedAt = new Date().toISOString();
  store.set(listId, list);

  // Also update listIds on contact items
  const contactsStore = getContactsRepoStore();
  contactIds.forEach((cid) => {
    const contact = contactsStore.get(cid);
    if (contact) {
      const cListIds = new Set(contact.listIds || []);
      cListIds.add(listId);
      contact.listIds = Array.from(cListIds);
      contactsStore.set(cid, contact);
    }
  });

  return list;
}

export function removeContactFromList(listId: string, contactId: string): ContactList | null {
  const store = getListsStore();
  const list = store.get(listId);
  if (!list) return null;

  list.contactIds = list.contactIds.filter((id) => id !== contactId);
  list.contactCount = list.contactIds.length;
  list.updatedAt = new Date().toISOString();
  store.set(listId, list);

  // Remove listId from contact
  const contactsStore = getContactsRepoStore();
  const contact = contactsStore.get(contactId);
  if (contact && contact.listIds) {
    contact.listIds = contact.listIds.filter((lid) => lid !== listId);
    contactsStore.set(contactId, contact);
  }

  return list;
}
