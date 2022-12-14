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
      seed: 'rum://seed?v=1&e=0&n=0&b=yip_t4S2RNiO1sFmaiwlkQ&c=V5pWAkyge-8geaZlTN8_8EbTkaLQXk19K9STkIawyVA&g=DNCIf1kSSICAxRGFU-UyzA&k=AvgKU6H3V45K92PROFn3uONo39MT7ATaicpltWHlrWYb&s=6keHAYyYAduCgPocmimQcMh9bdlsklh1JBZt_c47YE5oBFnFoYFu_fj86qiCtqavzwlEtHpxcBIU_thbAadd6gE&t=FynT3F4qNoY&a=posts.dev&y=group_timeline&u=http%3A%2F%2F103.61.39.166%3A6090%3Fjwt%3DeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGxvd0dyb3VwcyI6WyIwY2QwODg3Zi01OTEyLTQ4ODAtODBjNS0xMTg1NTNlNTMyY2MiXSwiZXhwIjoxODI2Nzc4MDgxLCJuYW1lIjoiYWxsb3ctMGNkMDg4N2YtNTkxMi00ODgwLTgwYzUtMTE4NTUzZTUzMmNjIiwicm9sZSI6Im5vZGUifQ.HnhlfxnkLKJaVZ9i-vloDDDR8p4If6eT54WYWe6DQC8',
    },

    comment: {
      seed: 'rum://seed?v=1&e=0&n=0&b=1a1rkOB9SvOiWEbFaXYnZA&c=qVidhkRw_YlxpKpmqfSm_UB_2-pZD_tiCtof4OFVXn0&g=rpHqT5lkQqet0TFpVgUG4g&k=AieHdMYkaB891NyIMNsLH89kQo74d0L4GagWOWH09twS&s=UVPCE1RXW6IFz1lrh9uSmv3xwBi4xNrcbGVzzlqCIP9e7eR-0D4n6vddFi1dCY1iaV5TqFAhSLfutM2XdY4uKgE&t=FynT4E3tm4Q&a=comments.dev&y=group_timeline&u=http%3A%2F%2F103.61.39.166%3A6090%3Fjwt%3DeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGxvd0dyb3VwcyI6WyJhZTkxZWE0Zi05OTY0LTQyYTctYWRkMS0zMTY5NTYwNTA2ZTIiXSwiZXhwIjoxODI2Nzc4MDk4LCJuYW1lIjoiYWxsb3ctYWU5MWVhNGYtOTk2NC00MmE3LWFkZDEtMzE2OTU2MDUwNmUyIiwicm9sZSI6Im5vZGUifQ.xX_Y4Mb4o1Mlo-Zkz7qN2XG62FZiBr3O5sCHmyf892M'
    },

    counter: {
      seed: 'rum://seed?v=1&e=0&n=0&b=l-ftE4kuT9WgqpGZJVXWDA&c=dsklyZqsFh20pqvR6HrE37Wycckh0zRK3T23JeZCryc&g=idBI5y7NRXGAwNoAIYFA-g&k=AwX7ZxE1Zi3LIkK21Th3m1bx9GJS06ZrKT0mGj6T715h&s=7Goy_B4e47fyPYGuW-q3vTtoRQsHZ5vCEWS8SxlSdGVm1dB0MPxC0cnpf12LcHPr0HyAT4FSYQPWVh2oHf0jcAA&t=FynT611Km-E&a=counters.dev&y=group_timeline&u=http%3A%2F%2F103.61.39.166%3A6090%3Fjwt%3DeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGxvd0dyb3VwcyI6WyI4OWQwNDhlNy0yZWNkLTQ1NzEtODBjMC1kYTAwMjE4MTQwZmEiXSwiZXhwIjoxODI2Nzc4MTUzLCJuYW1lIjoiYWxsb3ctODlkMDQ4ZTctMmVjZC00NTcxLTgwYzAtZGEwMDIxODE0MGZhIiwicm9sZSI6Im5vZGUifQ.pERLocc1PI5C6BLsSyukIOzSxa5Ljln7_CBfS3ubVUw'
    },

    profile: {
      seed: 'rum://seed?v=1&e=0&n=0&b=s4RE7UNZRt67GqX94vlU7w&c=BJ7dnw5bFaSqA4luFJKph9z3tbmcLEX4Cd7403MHQ-o&g=h8YzoJ6fTeuXh_3SztmPdA&k=AovpiPaYc-bXyuzx1kToTFhtW95vOtBZXFkd1YWVmbZ3&s=r_9MdL0_k3lfoGllcmsjszUkU0-SeRlaafKqXLjk8a4xjmME9gl3HE46V6QVC8nokSRA80rJROfWFHCq0UvptgA&t=FynT5Ga1qHc&a=profiles.dev&y=group_timeline&u=http%3A%2F%2F103.61.39.166%3A6090%3Fjwt%3DeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGxvd0dyb3VwcyI6WyI4N2M2MzNhMC05ZTlmLTRkZWItOTc4Ny1mZGQyY2VkOThmNzQiXSwiZXhwIjoxODI2Nzc4MTE2LCJuYW1lIjoiYWxsb3ctODdjNjMzYTAtOWU5Zi00ZGViLTk3ODctZmRkMmNlZDk4Zjc0Iiwicm9sZSI6Im5vZGUifQ.HGdshIU2qFzWCZHhREoOP2aidv2Jkm1oaGbEWG6kI0M'
    }
  },

  nft: {
    name: 'CNFT',
    collection_id: 'dbef5999-fcb1-4f58-b84f-6b7af9694280',
    icon_url: 'https://trident.ap-south-1.linodeobjects.com/pd8k4hm8yethsie0yk0fo07cvaqy',
    buy_url: 'https://thetrident.one/collections/dbef5999-fcb1-4f58-b84f-6b7af9694280/collectibles?filter=on_sale&query=&sort_by=price_asc#tabbar'
  }
}
