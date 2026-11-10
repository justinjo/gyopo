export interface Flashcard {chinese:string;pinyin:string;english:string}
export interface FlashcardLesson {id:string;number:number;title:string;chineseTitle:string;cards:Flashcard[]}
export const flashcardLessons:FlashcardLesson[]=[
  {
    "id": "house-family",
    "number": 1,
    "title": "House and family",
    "chineseTitle": "家和家人",
    "cards": [
      {
        "chinese": "公寓",
        "english": "apartment",
        "pinyin": "gōngyù"
      },
      {
        "chinese": "客厅",
        "english": "living room",
        "pinyin": "kètīng"
      },
      {
        "chinese": "卧室",
        "english": "bedroom",
        "pinyin": "wòshì"
      },
      {
        "chinese": "厨房",
        "english": "kitchen",
        "pinyin": "chúfáng"
      },
      {
        "chinese": "浴室",
        "english": "bathroom",
        "pinyin": "yùshì"
      },
      {
        "chinese": "家人",
        "english": "family",
        "pinyin": "jiārén"
      },
      {
        "chinese": "父母",
        "english": "parents",
        "pinyin": "fùmǔ"
      },
      {
        "chinese": "弟弟",
        "english": "younger brother",
        "pinyin": "dìdi"
      },
      {
        "chinese": "邻居",
        "english": "neighbor",
        "pinyin": "línjū"
      },
      {
        "chinese": "大",
        "english": "big",
        "pinyin": "dà"
      },
      {
        "chinese": "小",
        "english": "small",
        "pinyin": "xiǎo"
      },
      {
        "chinese": "明亮",
        "english": "bright",
        "pinyin": "míngliàng"
      },
      {
        "chinese": "宽敞",
        "english": "spacious",
        "pinyin": "kuānchang"
      },
      {
        "chinese": "狭窄",
        "english": "narrow",
        "pinyin": "xiázhǎi"
      },
      {
        "chinese": "干净",
        "english": "clean",
        "pinyin": "gānjìng"
      },
      {
        "chinese": "整洁",
        "english": "neat, tidy",
        "pinyin": "zhěngjié"
      },
      {
        "chinese": "安静",
        "english": "quiet",
        "pinyin": "ānjìng"
      },
      {
        "chinese": "方便",
        "english": "convenient",
        "pinyin": "fāngbiàn"
      },
      {
        "chinese": "舒服",
        "english": "comfortable",
        "pinyin": "shūfu"
      },
      {
        "chinese": "结实",
        "english": "sturdy",
        "pinyin": "jiēshi"
      },
      {
        "chinese": "友好",
        "english": "friendly",
        "pinyin": "yǒuhǎo"
      },
      {
        "chinese": "活泼",
        "english": "active, outgoing",
        "pinyin": "huópo"
      },
      {
        "chinese": "内向",
        "english": "introverted",
        "pinyin": "nèixiàng"
      },
      {
        "chinese": "善良",
        "english": "kind",
        "pinyin": "shànliáng"
      },
      {
        "chinese": "相处融洽",
        "english": "to get along well",
        "pinyin": "xiāngchǔ róngqià"
      }
    ]
  },
  {
    "id": "animals-opinions",
    "number": 2,
    "title": "Animals and opinions",
    "chineseTitle": "动物和想法",
    "cards": [
      {
        "chinese": "动物",
        "english": "animal",
        "pinyin": "dòngwù"
      },
      {
        "chinese": "宠物",
        "english": "pet",
        "pinyin": "chǒngwù"
      },
      {
        "chinese": "只",
        "english": "measure word for small animals",
        "pinyin": "zhī"
      },
      {
        "chinese": "小狗",
        "english": "puppy",
        "pinyin": "xiǎogǒu"
      },
      {
        "chinese": "猫",
        "english": "cat",
        "pinyin": "māo"
      },
      {
        "chinese": "兔子",
        "english": "rabbit",
        "pinyin": "tùzi"
      },
      {
        "chinese": "狮子",
        "english": "lion",
        "pinyin": "shīzi"
      },
      {
        "chinese": "老虎",
        "english": "tiger",
        "pinyin": "lǎohǔ"
      },
      {
        "chinese": "猴子",
        "english": "monkey",
        "pinyin": "hóuzi"
      },
      {
        "chinese": "大象",
        "english": "elephant",
        "pinyin": "dàxiàng"
      },
      {
        "chinese": "长颈鹿",
        "english": "giraffe",
        "pinyin": "chángjǐnglù"
      },
      {
        "chinese": "熊",
        "english": "bear",
        "pinyin": "xióng"
      },
      {
        "chinese": "狐狸",
        "english": "fox",
        "pinyin": "húli"
      },
      {
        "chinese": "动物园",
        "english": "zoo",
        "pinyin": "dòngwùyuán"
      },
      {
        "chinese": "养",
        "english": "to raise (a pet)",
        "pinyin": "yǎng"
      },
      {
        "chinese": "可爱",
        "english": "cute",
        "pinyin": "kě’ài"
      },
      {
        "chinese": "可怕",
        "english": "scary",
        "pinyin": "kěpà"
      },
      {
        "chinese": "强壮",
        "english": "strong",
        "pinyin": "qiángzhuàng"
      },
      {
        "chinese": "慢",
        "english": "slow",
        "pinyin": "màn"
      },
      {
        "chinese": "快",
        "english": "fast",
        "pinyin": "kuài"
      },
      {
        "chinese": "好吃",
        "english": "delicious",
        "pinyin": "hǎochī"
      },
      {
        "chinese": "难吃",
        "english": "not tasty",
        "pinyin": "nánchī"
      },
      {
        "chinese": "还行",
        "english": "okay",
        "pinyin": "hái xíng"
      },
      {
        "chinese": "不好",
        "english": "bad",
        "pinyin": "bù hǎo"
      },
      {
        "chinese": "外向",
        "english": "extroverted",
        "pinyin": "wàixiàng"
      }
    ]
  },
  {
    "id": "transport-places",
    "number": 3,
    "title": "Transport and places",
    "chineseTitle": "交通和地点",
    "cards": [
      {
        "chinese": "公司",
        "english": "company",
        "pinyin": "gōngsī"
      },
      {
        "chinese": "学校",
        "english": "school",
        "pinyin": "xuéxiào"
      },
      {
        "chinese": "地铁",
        "english": "subway",
        "pinyin": "dìtiě"
      },
      {
        "chinese": "公共汽车",
        "english": "bus",
        "pinyin": "gōnggòng qìchē"
      },
      {
        "chinese": "自行车",
        "english": "bicycle",
        "pinyin": "zìxíngchē"
      },
      {
        "chinese": "出租车",
        "english": "taxi",
        "pinyin": "chūzūchē"
      },
      {
        "chinese": "火车",
        "english": "train",
        "pinyin": "huǒchē"
      },
      {
        "chinese": "飞机",
        "english": "airplane",
        "pinyin": "fēijī"
      },
      {
        "chinese": "汽车",
        "english": "car",
        "pinyin": "qìchē"
      },
      {
        "chinese": "步行",
        "english": "on foot",
        "pinyin": "bùxíng"
      },
      {
        "chinese": "花时间",
        "english": "to take time",
        "pinyin": "huā shíjiān"
      },
      {
        "chinese": "分钟",
        "english": "minute",
        "pinyin": "fēnzhōng"
      },
      {
        "chinese": "小时",
        "english": "hour",
        "pinyin": "xiǎoshí"
      },
      {
        "chinese": "多久",
        "english": "how long",
        "pinyin": "duōjiǔ"
      },
      {
        "chinese": "大约",
        "english": "about, around",
        "pinyin": "dàyuē"
      },
      {
        "chinese": "上班",
        "english": "to go to work",
        "pinyin": "shàngbān"
      },
      {
        "chinese": "下班",
        "english": "to leave work",
        "pinyin": "xiàbān"
      },
      {
        "chinese": "乘坐",
        "english": "to ride, to take",
        "pinyin": "chéngzuò"
      },
      {
        "chinese": "图书馆",
        "english": "library",
        "pinyin": "túshūguǎn"
      },
      {
        "chinese": "公园",
        "english": "park",
        "pinyin": "gōngyuán"
      },
      {
        "chinese": "机场",
        "english": "airport",
        "pinyin": "jīchǎng"
      },
      {
        "chinese": "百货商店",
        "english": "department store",
        "pinyin": "bǎihuò shāngdiàn"
      },
      {
        "chinese": "海边",
        "english": "seaside",
        "pinyin": "hǎibiān"
      },
      {
        "chinese": "吵闹",
        "english": "noisy",
        "pinyin": "chǎonào"
      },
      {
        "chinese": "累",
        "english": "tired",
        "pinyin": "lèi"
      }
    ]
  },
  {
    "id": "requests-obligations",
    "number": 4,
    "title": "Requests and obligations",
    "chineseTitle": "请求和义务",
    "cards": [
      {
        "chinese": "坐",
        "english": "to sit",
        "pinyin": "zuò"
      },
      {
        "chinese": "等",
        "english": "to wait",
        "pinyin": "děng"
      },
      {
        "chinese": "起床",
        "english": "to get up",
        "pinyin": "qǐchuáng"
      },
      {
        "chinese": "睡觉",
        "english": "to sleep",
        "pinyin": "shuìjiào"
      },
      {
        "chinese": "洗",
        "english": "to wash",
        "pinyin": "xǐ"
      },
      {
        "chinese": "打扫",
        "english": "to clean",
        "pinyin": "dǎsǎo"
      },
      {
        "chinese": "做饭",
        "english": "to cook",
        "pinyin": "zuòfàn"
      },
      {
        "chinese": "休息",
        "english": "to rest",
        "pinyin": "xiūxi"
      },
      {
        "chinese": "运动",
        "english": "to exercise",
        "pinyin": "yùndòng"
      },
      {
        "chinese": "听",
        "english": "to listen",
        "pinyin": "tīng"
      },
      {
        "chinese": "读",
        "english": "to read",
        "pinyin": "dú"
      },
      {
        "chinese": "写",
        "english": "to write",
        "pinyin": "xiě"
      },
      {
        "chinese": "说",
        "english": "to speak",
        "pinyin": "shuō"
      },
      {
        "chinese": "下车",
        "english": "to get off",
        "pinyin": "xiàchē"
      },
      {
        "chinese": "拍照",
        "english": "to take a photo",
        "pinyin": "pāizhào"
      },
      {
        "chinese": "卖",
        "english": "to sell",
        "pinyin": "mài"
      },
      {
        "chinese": "制作",
        "english": "to make",
        "pinyin": "zhìzuò"
      },
      {
        "chinese": "背诵",
        "english": "to memorize",
        "pinyin": "bèisòng"
      },
      {
        "chinese": "作业",
        "english": "homework",
        "pinyin": "zuòyè"
      },
      {
        "chinese": "考试",
        "english": "exam, test",
        "pinyin": "kǎoshì"
      },
      {
        "chinese": "提问",
        "english": "to ask a question",
        "pinyin": "tíwèn"
      },
      {
        "chinese": "录音",
        "english": "to record",
        "pinyin": "lùyīn"
      },
      {
        "chinese": "脱",
        "english": "to take off",
        "pinyin": "tuō"
      },
      {
        "chinese": "药",
        "english": "medicine",
        "pinyin": "yào"
      },
      {
        "chinese": "感冒",
        "english": "to catch a cold",
        "pinyin": "gǎnmào"
      }
    ]
  }
]
