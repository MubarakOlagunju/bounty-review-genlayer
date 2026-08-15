# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
 
from genlayer import *
import json
import typing
 
class BountyReview(gl.Contract):
    is_open: bool
    bounty_title: str
    bounty_criteria: str
    reward_amount: u256
    winner_address: str
    winning_submission_url: str
 
    def __init__(self, title: str, criteria: str, reward: u256):
        self.is_open = True
        self.bounty_title = title
        self.bounty_criteria = criteria
        self.reward_amount = reward
        self.winner_address = ""
        self.winning_submission_url = ""
 
    @gl.public.write
    def evaluate_submission(self, submission_url: str, submitter_address: str) -> typing.Any:
        
        if not self.is_open:
            raise gl.vm.UserError("This bounty is already closed and paid out.")
 
        bounty_criteria = self.bounty_criteria
 
        def check_work() -> typing.Any:
            # 1. SAFETY NET: Protect against invalid URLs crashing the web scraper
            try:
                web_data = gl.nondet.web.render(submission_url, mode="text")
                print("Successfully scraped URL data.")
            except Exception as e:
                print(f"Scraper Error: {str(e)}")
                return {
                    "meets_criteria": False,
                    "feedback": "Network Error: Could not read the submitted URL. Ensure it is public."
                }
 
            task = f"""
You are an AI evaluator for a Web3 developer bounty platform.
Your task is to determine if the submitted work strictly meets the following criteria:
 
CRITERIA:
"{bounty_criteria}"
 
SUBMITTED CONTENT:
{web_data}
End of submitted content.
 
Based on the submitted content, evaluate if it successfully fulfills the criteria.
Respond with the following JSON format:
{{
    "meets_criteria": bool,
    "feedback": str 
}}
It is mandatory that you respond only using the JSON format above, nothing else. Don't include any other words or characters, your output must be only JSON without any formatting prefix or suffix.
This result should be perfectly parsable by a JSON parser without errors.
            """
            
            # 2. SAFETY NET: Protect against missing LLM API keys or AI timeouts
            try:
                result = gl.nondet.exec_prompt(task).replace("```json", "").replace("```", "").strip()
                print("Successfully executed AI prompt.")
                return json.loads(result)
            except Exception as e:
                print(f"AI Error: {str(e)}")
                return {
                    "meets_criteria": False,
                    "feedback": "AI Engine Error: The evaluation failed to execute properly. Check simulator configuration."
                }
 
        result_json = gl.eq_principle.strict_eq(check_work)
 
        if result_json.get("meets_criteria") == True:
            self.is_open = False
            self.winner_address = submitter_address
            self.winning_submission_url = submission_url
 
        return result_json
 
    @gl.public.view
    def get_bounty_data(self) -> dict[str, typing.Any]:
        return {
            "title": self.bounty_title,
            "criteria": self.bounty_criteria,
            "reward_amount": self.reward_amount,
            "is_open": self.is_open,
            "winner_address": self.winner_address,
            "winning_submission_url": self.winning_submission_url,
        }