from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
import uuid
from datetime import datetime

from app.models import TaskCreate, TaskUpdate, Task, User
from app.routers.auth import get_current_user
from app.database import get_supabase

router = APIRouter()

@router.post("/", response_model=Task)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user)
):
    # Additional validation for title
    if not task.title or not task.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task title cannot be empty"
        )

    supabase = get_supabase()

    task_data = {
        "id": str(uuid.uuid4()),
        "title": task.title.strip(),
        "description": task.description,
        "status": task.status.value,
        "user_id": current_user.id,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }

    response = supabase.table("tasks").insert(task_data).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create task")

    created_task = response.data[0]
    return Task(
        id=created_task["id"],
        title=created_task["title"],
        description=created_task["description"],
        status=created_task["status"],
        user_id=created_task["user_id"],
        created_at=datetime.fromisoformat(created_task["created_at"]),
        updated_at=datetime.fromisoformat(created_task["updated_at"])
    )

@router.get("/", response_model=List[Task])
async def get_tasks(current_user: User = Depends(get_current_user)):
    supabase = get_supabase()

    response = supabase.table("tasks").select("*").eq("user_id", current_user.id).execute()

    tasks = []
    for task_data in response.data:
        tasks.append(Task(
            id=task_data["id"],
            title=task_data["title"],
            description=task_data["description"],
            status=task_data["status"],
            user_id=task_data["user_id"],
            created_at=datetime.fromisoformat(task_data["created_at"]),
            updated_at=datetime.fromisoformat(task_data["updated_at"])
        ))

    return tasks

@router.get("/{task_id}", response_model=Task)
async def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    supabase = get_supabase()

    response = supabase.table("tasks").select("*").eq("id", task_id).eq("user_id", current_user.id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")

    task_data = response.data[0]
    return Task(
        id=task_data["id"],
        title=task_data["title"],
        description=task_data["description"],
        status=task_data["status"],
        user_id=task_data["user_id"],
        created_at=datetime.fromisoformat(task_data["created_at"]),
        updated_at=datetime.fromisoformat(task_data["updated_at"])
    )

@router.put("/{task_id}", response_model=Task)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user)
):
    supabase = get_supabase()

    # Check if task exists and belongs to user
    existing_task = supabase.table("tasks").select("*").eq("id", task_id).eq("user_id", current_user.id).execute()

    if not existing_task.data:
        raise HTTPException(status_code=404, detail="Task not found")

    # Prepare update data
    update_data = {"updated_at": datetime.utcnow().isoformat()}

    if task_update.title is not None:
        # Additional validation for title
        if not task_update.title.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task title cannot be empty"
            )
        update_data["title"] = task_update.title.strip()
    if task_update.description is not None:
        update_data["description"] = task_update.description
    if task_update.status is not None:
        update_data["status"] = task_update.status.value

    response = supabase.table("tasks").update(update_data).eq("id", task_id).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to update task")

    updated_task = response.data[0]
    return Task(
        id=updated_task["id"],
        title=updated_task["title"],
        description=updated_task["description"],
        status=updated_task["status"],
        user_id=updated_task["user_id"],
        created_at=datetime.fromisoformat(updated_task["created_at"]),
        updated_at=datetime.fromisoformat(updated_task["updated_at"])
    )

@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    supabase = get_supabase()

    # Check if task exists and belongs to user
    existing_task = supabase.table("tasks").select("*").eq("id", task_id).eq("user_id", current_user.id).execute()

    if not existing_task.data:
        raise HTTPException(status_code=404, detail="Task not found")

    response = supabase.table("tasks").delete().eq("id", task_id).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to delete task")

    return {"message": "Task deleted successfully"}

@router.patch("/{task_id}/toggle", response_model=Task)
async def toggle_task_status(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    supabase = get_supabase()

    # Get current task
    response = supabase.table("tasks").select("*").eq("id", task_id).eq("user_id", current_user.id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")

    task_data = response.data[0]
    current_status = task_data["status"]

    # Toggle status
    new_status = "completed" if current_status == "pending" else "pending"

    update_data = {
        "status": new_status,
        "updated_at": datetime.utcnow().isoformat()
    }

    response = supabase.table("tasks").update(update_data).eq("id", task_id).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to update task")

    updated_task = response.data[0]
    return Task(
        id=updated_task["id"],
        title=updated_task["title"],
        description=updated_task["description"],
        status=updated_task["status"],
        user_id=updated_task["user_id"],
        created_at=datetime.fromisoformat(updated_task["created_at"]),
        updated_at=datetime.fromisoformat(updated_task["updated_at"])
    )
