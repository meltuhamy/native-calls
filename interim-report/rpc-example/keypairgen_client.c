#include "keypairgen.h"

void
keypairgen_program_0( char* host )
{
	CLIENT *clnt;
	key_pair_t  *result_1;
	char * generate_keypair_0_arg;
	clnt = clnt_create(host, KEYPAIRGEN_PROGRAM, KEYPAIRGEN_VERSION, "udp");
	if (clnt == NULL) {
		clnt_pcreateerror(host);
		exit(1);
	}
	result_1 = generate_keypair_0(&generate_keypair_0_arg, clnt);
	if (result_1 == NULL) {
		clnt_perror(clnt, "call failed:");
	}
	clnt_destroy( clnt );
}


main( int argc, char* argv[] )
{
	char *host;

	if(argc < 2) {
		printf("usage: %s server_host\n", argv[0]);
		exit(1);
	}
	host = argv[1];
	keypairgen_program_0( host );
}
