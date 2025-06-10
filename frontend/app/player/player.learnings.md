1. /api/tests/:id,  in the backend use `req.params.id` to fetch this otherwise send it in req body like this 
``` axios.post('/api/tests',{testId : id}, {withCredentials : true}) ```

`{
    "_id": "68417de53f6431ec2feb231a",
    "name": "DB & SQL_Med_6",
    "subjects": [
        "6834e80d35110b44429ba013",
        "6834e80d35110b44429ba010"
    ],
    "questionIds": [
        "68377b0f06bfb42d7b84d29c",
        "68377b0f06bfb42d7b84d29e",
        "68377005fd5dd1590d82a2e2",
        "6836a1b9723b847aa64c2a83",
        "68377b0f06bfb42d7b84d2a0",
        "6836a1b9723b847aa64c2a80"
    ],
    "totalQuestions": 6,
    "timeLimit": 10,
    "shuffleQuestions": true,
    "shuffleOptions": true,
    "createdBy": "682f8ddffd964bae2a0eef31",
    "createdAt": "2025-06-05T11:22:13.890Z",
    "updatedAt": "2025-06-05T11:22:13.890Z",
    "__v": 0
}`


# Params id issue, order of routes
Problem:
The route /api/tests/questions is being matched as /api/tests/:id with id = "questions", because /api/tests/:id comes before /api/tests/questions.
So, when you POST to /api/tests/questions, it actually triggers the fetchTest controller with id = "questions", which is not a valid ObjectId, and you get "Test not found!!!".

Solution:
Move the more specific /questions and /submit/:id routes above the /:id route: