export type TopicId = "prog" | "ds" | "dbms" | "cn";
export type Difficulty = 1 | 2 | 3;

export const TOPICS: { id: TopicId; name: string; short: string }[] = [
  { id: "prog", name: "Programming Fundamentals", short: "Programming" },
  { id: "ds", name: "Data Structures", short: "Data Structures" },
  { id: "dbms", name: "Database Management Systems", short: "DBMS" },
  { id: "cn", name: "Computer Networks", short: "Networks" },
];

export const topicName = (id: TopicId) => TOPICS.find((t) => t.id === id)!.name;
export const DIFFICULTY_LABEL: Record<Difficulty, string> = { 1: "Easy", 2: "Medium", 3: "Hard" };

export interface Lesson {
  topic: TopicId;
  title: string;
  minutes: number;
  explanation: string;
  keyPoints: string[];
  example: { title: string; body: string; code?: string };
  practice: { prompt: string; options: string[]; answer: number; explain: string };
}

export const LESSONS: Lesson[] = [
  {
    topic: "prog",
    title: "Variables, Loops & Functions",
    minutes: 12,
    explanation:
      "A program is a list of instructions. Variables store values, conditions let the program make decisions, loops repeat work, and functions package reusable steps under a name.",
    keyPoints: [
      "A variable is a named box that holds a value (e.g. age = 20).",
      "if / else chooses between paths based on a condition.",
      "for and while loops repeat a block of code.",
      "Functions take inputs (parameters) and can return an output.",
    ],
    example: {
      title: "Sum of numbers 1 to n",
      body: "We loop from 1 to n, adding each number to a running total, then return it. For n = 4 → 1+2+3+4 = 10.",
      code: "def total(n):\n    s = 0\n    for i in range(1, n + 1):\n        s += i\n    return s\n\nprint(total(4))  # 10",
    },
    practice: {
      prompt: "What does this print?  x = 3; for i in range(2): x = x * 2; print(x)",
      options: ["6", "12", "9", "3"],
      answer: 1,
      explain: "The loop runs twice: 3 → 6 → 12.",
    },
  },
  {
    topic: "ds",
    title: "Arrays, Stacks & Queues",
    minutes: 15,
    explanation:
      "Data structures organise data so we can use it efficiently. Arrays store items in order by index, stacks follow Last-In-First-Out, and queues follow First-In-First-Out.",
    keyPoints: [
      "Array access by index is O(1).",
      "Stack: push / pop from the top (LIFO) — like a pile of plates.",
      "Queue: enqueue at the back, dequeue at the front (FIFO) — like a ticket line.",
      "Choosing the right structure makes algorithms faster.",
    ],
    example: {
      title: "Undo with a stack",
      body: "A text editor pushes each action onto a stack. Pressing Undo pops the most recent action — the last thing you did is the first undone.",
      code: "stack = []\nstack.append('type A')\nstack.append('type B')\nstack.pop()   # undoes 'type B'",
    },
    practice: {
      prompt: "Push 1, 2, 3 onto a stack, then pop once. What is on top?",
      options: ["1", "2", "3", "Empty"],
      answer: 1,
      explain: "Popping removes 3 (the last pushed), so 2 is now on top.",
    },
  },
  {
    topic: "dbms",
    title: "Tables, Keys & SQL Basics",
    minutes: 14,
    explanation:
      "A relational database stores data in tables of rows and columns. Keys uniquely identify rows and link tables together. SQL is the language used to query and change the data.",
    keyPoints: [
      "Primary key: uniquely identifies each row in a table.",
      "Foreign key: a column that refers to another table's primary key.",
      "SELECT reads data; WHERE filters rows; JOIN combines tables.",
      "Normalization reduces duplicated data.",
    ],
    example: {
      title: "Find students with marks above 80",
      body: "We select the name column from the Students table, filtering rows using WHERE.",
      code: "SELECT name\nFROM Students\nWHERE marks > 80;",
    },
    practice: {
      prompt: "Which SQL clause filters rows?",
      options: ["ORDER BY", "WHERE", "GROUP BY", "FROM"],
      answer: 1,
      explain: "WHERE keeps only the rows that satisfy a condition.",
    },
  },
  {
    topic: "cn",
    title: "OSI Model, IP & Protocols",
    minutes: 13,
    explanation:
      "Computer networks let devices exchange data. The OSI model splits communication into 7 layers. IP addresses identify devices, and protocols like TCP, UDP and HTTP define how data is sent.",
    keyPoints: [
      "OSI layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.",
      "IP (Network layer) routes packets between networks.",
      "TCP is reliable and ordered; UDP is fast but not guaranteed.",
      "HTTP/HTTPS (Application layer) powers the web.",
    ],
    example: {
      title: "Opening a website",
      body: "DNS turns example.com into an IP address, TCP opens a reliable connection, then HTTP requests the page. Each step lives on a different layer.",
    },
    practice: {
      prompt: "Video calls often prefer which protocol for speed?",
      options: ["TCP", "UDP", "FTP", "SMTP"],
      answer: 1,
      explain: "UDP skips retransmission, so live audio/video stays real-time.",
    },
  },
];

export const lessonFor = (t: TopicId) => LESSONS.find((l) => l.topic === t)!;

export interface Question {
  id: string;
  topic: TopicId;
  difficulty: Difficulty;
  q: string;
  options: [string, string, string, string];
  answer: number;
  explain: string;
  simple: string;
}

export const QUESTIONS: Question[] = [
  // Programming
  { id: "p1", topic: "prog", difficulty: 1, q: "Which of these is used to repeat a block of code?", options: ["Variable", "Loop", "Comment", "Constant"], answer: 1, explain: "Loops (for / while) execute a block repeatedly until a condition is met.", simple: "Think of a loop like doing 10 push-ups: the same action, repeated." },
  { id: "p2", topic: "prog", difficulty: 1, q: "What does a function return?", options: ["Always nothing", "An output value (optionally)", "Only strings", "A loop"], answer: 1, explain: "A function may return a value to the code that called it using `return`.", simple: "A function is like a vending machine: you put something in, it can give something back." },
  { id: "p3", topic: "prog", difficulty: 2, q: "What is the output of: print(7 // 2) in Python?", options: ["3.5", "3", "4", "Error"], answer: 1, explain: "`//` is floor division, so 7 // 2 = 3 (the decimal part is dropped).", simple: "// means 'how many whole times does 2 fit into 7?' → 3." },
  { id: "p4", topic: "prog", difficulty: 2, q: "How many times does `for i in range(1, 5)` run?", options: ["5", "4", "6", "1"], answer: 1, explain: "range(1, 5) gives 1, 2, 3, 4 — the end value 5 is excluded.", simple: "range stops just before the end number, so 1 to 4 = 4 times." },
  { id: "p5", topic: "prog", difficulty: 3, q: "What is the time complexity of a loop nested inside another loop, each running n times?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: 2, explain: "The inner loop runs n times for each of n outer iterations: n × n = n².", simple: "If 10 friends each shake hands with 10 people, that's 10 × 10 = 100 handshakes." },
  // Data structures
  { id: "d1", topic: "ds", difficulty: 1, q: "Which data structure follows Last-In-First-Out (LIFO)?", options: ["Queue", "Stack", "Array", "Graph"], answer: 1, explain: "A stack removes the most recently added element first.", simple: "Like a pile of plates — you take the top plate, the one placed last." },
  { id: "d2", topic: "ds", difficulty: 1, q: "In a queue, where are new elements added?", options: ["Front", "Middle", "Rear / back", "Anywhere"], answer: 2, explain: "Queues are FIFO: enqueue at the rear, dequeue from the front.", simple: "Like a ticket line — new people join at the back." },
  { id: "d3", topic: "ds", difficulty: 2, q: "What is the time complexity of accessing arr[i] in an array?", options: ["O(n)", "O(1)", "O(log n)", "O(n²)"], answer: 1, explain: "Arrays use contiguous memory, so any index is computed directly in constant time.", simple: "Like jumping straight to seat number 12 instead of walking past every seat." },
  { id: "d4", topic: "ds", difficulty: 2, q: "Which structure is best for Breadth-First Search (BFS)?", options: ["Stack", "Queue", "Heap", "Hash set"], answer: 1, explain: "BFS visits nodes level by level, which a FIFO queue naturally provides.", simple: "BFS explores neighbours in the order found — first found, first explored, just like a queue." },
  { id: "d5", topic: "ds", difficulty: 3, q: "Searching in a balanced binary search tree takes:", options: ["O(n)", "O(1)", "O(log n)", "O(n log n)"], answer: 2, explain: "Each comparison halves the remaining nodes, so height ≈ log n.", simple: "Like guessing a number 1–100 by always halving: about 7 guesses." },
  // DBMS
  { id: "b1", topic: "dbms", difficulty: 1, q: "What uniquely identifies each row in a table?", options: ["Foreign key", "Primary key", "Index", "View"], answer: 1, explain: "A primary key is unique and not null for each row.", simple: "Like a roll number — no two students share it." },
  { id: "b2", topic: "dbms", difficulty: 1, q: "Which SQL command reads data?", options: ["INSERT", "UPDATE", "SELECT", "DELETE"], answer: 2, explain: "SELECT retrieves rows from one or more tables.", simple: "SELECT = 'show me'." },
  { id: "b3", topic: "dbms", difficulty: 2, q: "A foreign key is used to:", options: ["Encrypt data", "Link two tables", "Sort rows", "Delete duplicates"], answer: 1, explain: "A foreign key references the primary key of another table, creating a relationship.", simple: "It's like writing a friend's roll number in your notebook to point to them." },
  { id: "b4", topic: "dbms", difficulty: 2, q: "Which normal form removes partial dependency?", options: ["1NF", "2NF", "3NF", "BCNF"], answer: 1, explain: "2NF requires every non-key column to depend on the whole primary key, removing partial dependencies.", simple: "2NF: every detail must depend on the full key, not just part of it." },
  { id: "b5", topic: "dbms", difficulty: 3, q: "In ACID, which property ensures a transaction is all-or-nothing?", options: ["Consistency", "Isolation", "Durability", "Atomicity"], answer: 3, explain: "Atomicity means either every step of a transaction happens, or none do.", simple: "A bank transfer either fully moves the money or doesn't move it at all." },
  // Networks
  { id: "n1", topic: "cn", difficulty: 1, q: "How many layers are in the OSI model?", options: ["4", "5", "7", "9"], answer: 2, explain: "OSI has 7 layers, from Physical up to Application.", simple: "Remember: 'Please Do Not Throw Sausage Pizza Away' — 7 words, 7 layers." },
  { id: "n2", topic: "cn", difficulty: 1, q: "What does IP stand for?", options: ["Internet Protocol", "Internal Port", "Info Packet", "Internet Provider"], answer: 0, explain: "IP = Internet Protocol, which addresses and routes packets.", simple: "An IP address is like a home address for your device." },
  { id: "n3", topic: "cn", difficulty: 2, q: "Which protocol guarantees ordered, reliable delivery?", options: ["UDP", "TCP", "IP", "ICMP"], answer: 1, explain: "TCP uses acknowledgements and sequence numbers for reliable, ordered delivery.", simple: "TCP is like registered post — you get confirmation it arrived." },
  { id: "n4", topic: "cn", difficulty: 2, q: "DNS is mainly used to:", options: ["Encrypt traffic", "Translate domain names to IP addresses", "Assign MAC addresses", "Block viruses"], answer: 1, explain: "DNS resolves human-readable names like example.com into IP addresses.", simple: "DNS is the internet's phonebook." },
  { id: "n5", topic: "cn", difficulty: 3, q: "At which OSI layer do routers primarily operate?", options: ["Data Link", "Network", "Transport", "Session"], answer: 1, explain: "Routers forward packets using IP addresses, which belong to the Network layer (Layer 3).", simple: "Routers read the 'address' (IP), and addresses live on the Network layer." },
];

export const questionById = (id: string) => QUESTIONS.find((q) => q.id === id);
