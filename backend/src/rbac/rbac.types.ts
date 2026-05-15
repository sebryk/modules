export type Permission = {
   id: string;
   resource: string;
   action: string;
};

export type Role = {
   id: string;
   name: string;
   description: string | null;
   isSystem: boolean;
   permissions?: Permission[];
};
