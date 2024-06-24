import { Command, CommandRunner } from 'nest-commander';
import { UserService } from '../../common/services/user.service';
import { Logger } from '@nestjs/common';

@Command({
  name: 'create-test-user',
  description: 'Creates a hardcoded user, for testing purposes',
})
export class CreateTestUserCommand extends CommandRunner {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {
    super();
  }

  async run(): Promise<void> {
    const login = 'admin';
    const password = 'admin';
    this.logger.log(`Creating new user. Login: ${login}; pass: ${password}.`);
    const newUser = await this.userService.createUser({
      login,
      password,
      name: login,
    });
    this.logger.log(`User id is: ${newUser.id}`);
  }
}
