from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, Request

from app.dependencies.auth import verify_jwt
from app.models.savings import Milestone, SavingsPlan, SavingsPlanRequest, SavingsPlanResponse
from app.services.savings_service import savings_service

router = APIRouter(dependencies=[Depends(verify_jwt)])


@router.get("/savings-plan", response_model=SavingsPlan | None)
async def get_savings_plan(
    request: Request,
    claims: dict[str, Any] = Depends(verify_jwt),
) -> Any:
    """Return the active savings plan for the authenticated user."""
    user_id = claims.get("sub")
    if not user_id:
        return None

    # Mock data for now
    # In a real app, this would query a database
    return SavingsPlan(
        user_id=user_id,
        vault_id="mock-vault-id",
        goal_amount=10000.0,
        current_balance=4500.0,
        start_date=datetime.now() - timedelta(days=60),
        target_date=datetime.now() + timedelta(days=300),
        status="on_track",
        next_milestone=Milestone(
            date=datetime.now() + timedelta(days=30),
            target_amount=5000.0,
            description="Halfway to $10k",
        ),
    )


@router.post("/savings-plan", response_model=SavingsPlanResponse)
async def create_savings_plan(
    request: SavingsPlanRequest,
    claims: dict[str, Any] = Depends(verify_jwt),
) -> Any:
    """Generate a concrete, personalized deposit schedule based on user goals."""
    return await savings_service.generate_plan(request)
