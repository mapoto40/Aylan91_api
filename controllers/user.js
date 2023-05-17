import { Client } from "@notionhq/client";
import bcrypt from "bcrypt";
import { config } from "dotenv";
config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const newUser = async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 5);
  
    try {
        const usernameExists = await notion.databases.query({
            database_id: process.env.TABLE_ID,
            filter: {
                or: [
                  {
                    property: "Username",
                    title: {
                      equals: username,
                    },
                  },
                  {
                    property: "Email",
                    email: {
                      equals: email,
                    },
                  },
                ],
              },
            page_size: 1,
          });
  
      if (usernameExists.results.length > 0) {
          return res.status(409).json({ message: "Username or email already exists." });
      }
  
      const response = await notion.pages.create({
        parent: {
          database_id: process.env.TABLE_ID
        },
        properties: {
          Username: {
            title: [
              {
                text: {
                  content: username,
                },
              },
            ],
          },
          Email: {
            rich_text: [
              {
                text: {
                  content: email,
                },
              },
            ],
          },
          Password: {
            rich_text: [
              {
                text: {
                  content: hashedPassword,
                },
              },
            ],
          },
        },
      });
  
      res.status(201).json({ result: response });
    } catch (error) {
      res.status(409).json({ message: "An error occurred: " + error });
    }
  };

export const login = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const reponse = await notion.databases.query({
        database_id: process.env.TABLE_ID,
        filter: {
          or: [
            {
              property: "Username",
              title: {
                equals: username,
              },
            },
            {
              property: "Email",
              email: {
                equals: email,
              },
            },
          ],
        },
        page_size: 1,
    })

    if (reponse.results.length === 0) {
        return res.status(404).json({ message: "User not found." });
    }
    const user = reponse.results[0]
    const isValidPassword = bcrypt.compareSync(password, user.properties.Password.rich_text[0].text.content)

    if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid password." });
    }

    res.status(200).json({ result: user });
  } catch (err) {
    res.status(500).json({ message: "An error occurred: " + err });
  }
};