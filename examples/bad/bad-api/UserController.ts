export class UserController {
  setupRoutes(router: any) {
    // Violation of API-002: Verb in route path
    router.get("/getUserDetails", async (req: any, res: any) => {
      try {
        const user = { id: 1 };
        return res.json(user);
      } catch (err) {
        // Violation of API-001: Returning 200 in catch block
        return res.status(200).json({ error: "Failed to load user" });
      }
    });

    // Violation of API-003: POST creation endpoint returning 200 instead of 201
    router.post("/users", async (req: any, res: any) => {
      const newUser = { id: 2, name: req.body.name };
      return res.status(200).json(newUser);
    });

    // Violation of API-004: Raw string error response instead of structured object
    router.delete("/users/:id", async (req: any, res: any) => {
      return res.status(400).send("User deletion failed: invalid user ID");
    });
  }
}
