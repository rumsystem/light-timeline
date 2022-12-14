module.exports = {
  database: {
    host: "localhost",
    port: '5432',
    database: "circle",
    user: "circle",
    password: "39f12851f5275222e8b50fddddf04ee4",
    dialect: "postgres"
  },

  polling: {
    limit: 200,
    maxIndexingUnloadedGroup: 3,
  },

  origin: 'http://192.168.31.120:3000',

  serverOrigin: 'http://192.168.31.120:9000',

  admins: [
    '0x8842c866212D19a11864c0c3292A66023194Af04'
  ],

  presetGroup: {
    userRelation: {
      visible: true,
      seed: 'rum://seed?v=1&e=0&n=0&b=7lrZnYQQS7eb7tv4P7L0KQ&c=7tkCl_mvtQucUiz_1lLNnuVvnlZVkrUbrtcWm42lsBQ&g=GG2YvKjhTGOCwTu3X1_61g&k=AzFxruJHGoC1F44kuYfNymfAL49wrzA1zGhIS6sDJaNa&s=6P9_PLLHJzC7v20LLXTgE18Vf8He5keXV1D5vVm1wfM5GqH84Q6HuMgjUXcsOM709njGpOV1owDuiKd7nk-WpQA&t=FynUTzedhlA&a=relations.dev&y=group_relations&u=http%3A%2F%2F103.61.39.166%3A6090%3Fjwt%3DeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGxvd0dyb3VwcyI6WyIxODZkOThiYy1hOGUxLTRjNjMtODJjMS0zYmI3NWY1ZmZhZDYiXSwiZXhwIjoxODI2Nzc4NTc1LCJuYW1lIjoiYWxsb3ctMTg2ZDk4YmMtYThlMS00YzYzLTgyYzEtM2JiNzVmNWZmYWQ2Iiwicm9sZSI6Im5vZGUifQ.PoKNZAuO-LlrIR9_HjPdh-Fp_UcduaHt5wSXJ32IsdY'
    },

    post: {
      seed: 'rum://seed?v=1&e=0&n=0&b=-ThO_TbTTHqBy0FLJda95g&c=MB21mREKLHK1nWYT2Wa0I1hKkSKmNAh1l7Gd1S4K774&g=QwKhK9IeRAmPTKTc06R3sQ&k=A2CTSXtK__mgVLBUWmCCNluRxha7TH9foLGTJOrzclB8&s=ZtDRlVVrlGK3WsjpVxVJGv73siYRXRTRpggYXkCh2etAr6zGtenBcsRgdGhRnJsEsfYbfSU0x7WdRg9JuIqtdwE&t=FyoqtOTrvqw&a=posts.nft.dev&y=group_timeline&u=http%3A%2F%2F103.61.39.166%3A6090%3Fjwt%3DeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGxvd0dyb3VwcyI6WyI0MzAyYTEyYi1kMjFlLTQ0MDktOGY0Yy1hNGRjZDNhNDc3YjEiXSwiZXhwIjoxODI2ODczNTY5LCJuYW1lIjoiYWxsb3ctNDMwMmExMmItZDIxZS00NDA5LThmNGMtYTRkY2QzYTQ3N2IxIiwicm9sZSI6Im5vZGUifQ.dHTAgHtsjpGUtZcdwc8bAl5G1F6rZHhNTOotlXsJaoM',
      permissionRequired: true,
      chainApiToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGxvd0dyb3VwcyI6W10sImV4cCI6MTcwMDYzNDAyMiwibmFtZSI6Im5vZGUtYWxsLWdyb3VwcyIsInJvbGUiOiJjaGFpbiJ9.6aQlWRGi0apUu8S-AuTNyp0e9Dr_qwLSzr3RbQCizrM'
    },

    comment: {
      seed: 'rum://seed?v=1&e=0&n=0&b=RYpiwphATD60NJTDGiUXvQ&c=sFcy9eFnlgia3YU0WD-5aPO6j2YVSQQGRpr3JBo_WMM&g=kqPHDOh7QVizQWmSzE1Vlg&k=Au28Tl1fQO1qVeWzIcgdUP0EJM-xe8Nh71sfXRuUm9MY&s=2FyTOvbqRlcSt1d6KHvuHXC-p_LwHvovbKoUHH0wHaEI4XRYd4Biinmbzoifpm9WFl--L5h8cUOAv5z0IEVkKQE&t=FyoqjIW_ECA&a=comments.dev&y=group_comments&u=http%3A%2F%2F103.61.39.166%3A6090%3Fjwt%3DeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGxvd0dyb3VwcyI6WyI5MmEzYzcwYy1lODdiLTQxNTgtYjM0MS02OTkyY2M0ZDU1OTYiXSwiZXhwIjoxODI2ODczMzk2LCJuYW1lIjoiYWxsb3ctOTJhM2M3MGMtZTg3Yi00MTU4LWIzNDEtNjk5MmNjNGQ1NTk2Iiwicm9sZSI6Im5vZGUifQ.5IERfvGShysaJRgeX6skpcGmDfVVH3Nhnjzviv3gEJk'
    },

    counter: {
      seed: 'rum://seed?v=1&e=0&n=0&b=hZZ5Q2A_TYG9RH3S9BAauw&c=TbyuAFqznuSgFxf-O7r0iyTsWh42hkogfYN4fe-Eo44&g=eqHiZjNWR_mFN8RV15mDCA&k=AlSdZ7yzzK7jDvlNA8bW9C1A2t7jSR-2B9jpjPWFQJRV&s=ysk2lzF8Yrrc-Tlg3gvPpsy-h-aW_GFYQNuDDwINtI1h-DugPIRDo14JwHvbayq53Rb4KrMjmBYAtMaCpcqREwE&t=FyoqlAUEsYI&a=counters.dev&y=group_counters&u=http%3A%2F%2F103.61.39.166%3A6090%3Fjwt%3DeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGxvd0dyb3VwcyI6WyI3YWExZTI2Ni0zMzU2LTQ3ZjktODUzNy1jNDU1ZDc5OTgzMDgiXSwiZXhwIjoxODI2ODczNDI4LCJuYW1lIjoiYWxsb3ctN2FhMWUyNjYtMzM1Ni00N2Y5LTg1MzctYzQ1NWQ3OTk4MzA4Iiwicm9sZSI6Im5vZGUifQ.2Oi3QKXnJjNEM24qDXf7qZvbjgzrEo4Kj0Gdc7e617I'
    },

    profile: {
      seed: 'rum://seed?v=1&e=0&n=0&b=5DWSPpe7SX27Dsfce8p2iA&c=jVUgjo1MIjcicbbLsLok4LWvry4wxpOSZ_fkj-0CKBk&g=ETLXVqitSrWY5cUoeblAsw&k=A9mQ--gKIs4aCHgdMxJm8G0WyEY92oBkvLuKgdHXdrWT&s=Y38MzeVcmeA5WZqjzhhncclI1z5o_Ql4CtbSqE_8aWNd2oj_t3jBlf0QpfVaY0cQs6vec373-bBXOVMiKmKRbQE&t=FyoqkjSaD4M&a=profiles.dev&y=group_profiles&u=http%3A%2F%2F103.61.39.166%3A6090%3Fjwt%3DeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGxvd0dyb3VwcyI6WyIxMTMyZDc1Ni1hOGFkLTRhYjUtOThlNS1jNTI4NzliOTQwYjMiXSwiZXhwIjoxODI2ODczNDIwLCJuYW1lIjoiYWxsb3ctMTEzMmQ3NTYtYThhZC00YWI1LTk4ZTUtYzUyODc5Yjk0MGIzIiwicm9sZSI6Im5vZGUifQ.tBohOvp2ycV9DifJvIyVHEWHSNopAWl1HX9CkVbZa20'
    }
  },

  nft: {
    name: 'CNFT',
    collection_id: 'dbef5999-fcb1-4f58-b84f-6b7af9694280',
    icon_url: 'https://trident.ap-south-1.linodeobjects.com/pd8k4hm8yethsie0yk0fo07cvaqy',
    buy_url: 'https://thetrident.one/collections/dbef5999-fcb1-4f58-b84f-6b7af9694280/collectibles?filter=on_sale&query=&sort_by=price_asc#tabbar'
  }
}
