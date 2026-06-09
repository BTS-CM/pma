import { persistentMap } from "@nanostores/persistent";

type StoredBlocklist = {
  users: string[];
  timestamp: number;
};

const $blockList = persistentMap<StoredBlocklist>(
  "blocklist",
  {
    users: [],
    timestamp: Date.now(),
  },
  {
    encode(value) {
      return JSON.stringify(value);
    },
    decode(value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.log(e);
        return { users: [], timestamp: 0 };
      }
    },
  }
);

function updateBlockList(users: string[]) {
  console.log("Updating blocklist");
  $blockList.setKey("users", users);
  $blockList.setKey("timestamp", Date.now());
}

export type BlockedUser = {
  name: string;
  id: string;
};

type StoredUserBlocklist = {
  bitshares: BlockedUser[] | [];
  bitshares_testnet: BlockedUser[] | [];
};

const $userBlockList = persistentMap<StoredUserBlocklist>(
  "userBlocklist",
  {
    bitshares: [],
    bitshares_testnet: [],
  },
  {
    encode(value) {
      return JSON.stringify(value);
    },
    decode(value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.log(e);
        return value;
      }
    },
  }
);

function addBlockedUser(chain: string, user: BlockedUser) {
  const users = $userBlockList.get()[chain];
  if (users.find((u) => u.id === user.id)) {
    return; // already exists
  }
  users.push(user);
  $userBlockList.set({ ...$userBlockList.get(), [chain]: users });
}

function removeBlockedUser(chain: string, user: BlockedUser) {
  const users = $userBlockList.get()[chain];
  const index = users.findIndex((u) => u.id === user.id);
  if (index === -1) {
    return; // not found
  }
  users.splice(index, 1);
  $userBlockList.set({ ...$userBlockList.get(), [chain]: users });
}

export {
  $blockList,
  updateBlockList,
  $userBlockList,
  addBlockedUser,
  removeBlockedUser,
};
