enum TaskStatus {
  todo('TODO'),
  inProgress('IN_PROGRESS'),
  done('DONE');

  final String value;
  const TaskStatus(this.value);

  static TaskStatus fromString(String value) {
    return TaskStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => TaskStatus.todo,
    );
  }
}

class TaskEntity {
  final String id;
  final String title;
  final String? description;
  final TaskStatus status;
  final String userId;
  final DateTime createdAt;
  final DateTime updatedAt;

  TaskEntity({
    required this.id,
    required this.title,
    this.description,
    required this.status,
    required this.userId,
    required this.createdAt,
    required this.updatedAt,
  });
}
